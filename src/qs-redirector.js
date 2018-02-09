/**
 * Copyright (c) 2018-present, For it, Inc.
 * http://www.for-it.co.jp/
 *
 * This source code is licensed under the MIT license.
 * https://opensource.org/licenses/MIT
 */

/**
 * クエリ文字列全体を分解して、[{key1, value1}, {key2, value2}]のような配列を返す
 * ※ クラスの内部のみで使われるfunction
 *
 * @param  {string}         queryString `?`で始まるクエリ文字列全体
 * @return {Array{Object}}              クエリ文字列を分解した{key: value}の配列
 */
const getAllKeyValue = (queryString) => {
  if (!queryString || queryString === '?') {
    return [];
  }

  if (queryString.match(/^http/)) {
    throw new Error(`"${queryString}" is invalid arg. give value of "window.location.search"`);
  }

  // 最初の'?'を飛ばしてクエリを分割。途中の`?`は全部`&'に変換しておく
  const hash = queryString.replace(/^\?/, '').replace(/\?/g, '&').split("&");

  return hash.map((elm) => {
    // queryのkey-valueを取り出す
    const kvPair = elm.split("=");

    // `[key, value]` の形をオブジェクトとして組み立て直して返す
    return { [`${kvPair[0]}`]: `${kvPair[1]}` };
  });
};

/**
 * クエリ文字列ハッシュ配列を連結して `key1=value1&key2=value2` のような文字列を返す
 *
 * ※ クラスの内部のみで使われるfunction
 *
 * @param  {string}         queryString `?`で始まるクエリ文字列全体
 * @return {Array{Object}}              クエリ文字列を分解した{key: value}の配列
 */
const createQueryString = queryStringArray =>
  queryStringArray.map((elm) => {
    const key = Object.keys(elm)[0];
    return `${key}=${elm[key]}`;
  }).join('&');

/**
 * 引き渡すクエリ文字列をフィルターできるリダイレクタ。これが本体部分
 * クエリパラメータの操作機能も備えている
 */
class QsRedirector {
  /**
   * コンストラクタ
   * 引数はすべて省略可能
   *
   * @param {string}  [keyDest='d']                       リダイレクト先ディレクトリ・ファイル指定するキー
   * @param {Array<string>} [ignore=[]]                   リダイレクトしないクエリ文字列のキーの配列
   * @param {string}  [query=window.location.search]      `?`で始まるクエリ部分。通常は省略
   * @param {string}  [protocol=window.location.protocol] 転送先のプロトコル。ほとんどの場合 http / https のいずれか
   * @param {string}  [host=window.location.host]         転送先のドメイン(+ ポート)部分
   * @param {string}  [dest='']                           転送先のディレクトリ以下。クエリ文字列での指定よりも優先される
   * @param {boolean} [shouldSanitize=true]               `<>()`などの脆弱性に繋がりかねない文字列を削除をするかどうか
   *
   * @example
   * http://example.com/redirect?d=public/index.html&c=12345&x=xyz
   * で、到達したページ内で以下を実行すると……
   *
   * var cookieKey = 'c';
   * var r = new FilteredRedirector({ignore=[cookieKey]});
   * document.cookie = 'myCookie=' + r.getParamValue(cookieKey);
   * r.redirect();
   *
   * cookie保存後に、以下のURIにリダイレクトする
   * http://example.com/public/index.html?x=xyz
   * 飛び先指定の`d`と、無視対象に指定した`c`はリダイレクト先には渡らない
   */
  constructor({
    keyDest = 'd',
    ignore = [],
    query = window.location.search,
    protocol = window.location.protocol,
    host = window.location.host,
    dest = '',
    shouldSanitize = true
  }) {
    this.keyDest = keyDest;
    // `keyDest`も無視対象に加える。ついでに、`ignore` が配列でなく文字列だったら配列に変換する
    this.ignore = [...(Array.isArray(ignore) ? ignore : [ignore]), keyDest];
    this.protocol = protocol;
    this.host = host;
    this.fixedDest = dest;
    this.shouldSanitze = shouldSanitize;
    // JSONで使われず、XSSを目論んでそうなクエリ文字列を削除。雑なやり方なので扱い注意
    this.query =
      shouldSanitize ? query.replace(/[<>()]|%3C|%3E|%28|%29/g, '') : query;
    this.allQueryStringHash = getAllKeyValue(this.query);
  }

  /* ************************************************* */
  /* ************ クエリ文字列の操作メソッド群 ************ */
  /* ************************************************* */

  /**
   * keyを指定して、クエリ文字列から{key: value}を取得する
   * ※ key被りがある場合、最初の{key: value}しか返さないので注意
   *
   * @param  {string}         key クエリ文字列中のキー
   * @return {Array<Object>}      クエリ文字列から探し出した{key: value}
   */
  getParamHash(key) {
    return this.allQueryStringHash.filter(elm => Object.keys(elm)[0] === key)[0];
  }

  /**
   * キーを指定して、クエリ文字列から対応する値を取り出す
   * キーが存在しないときは空文字を返す
   *
   * @param {string}  key  クエリ文字列中のキー
   */
  getParamValue(key) {
    try {
      // 仮に複数のオブジェクトがあっても最初の１つしか見ない
      const targetHash = this.getParamHash(key);
      return targetHash[key];
    } catch (err) {
      console.error(`️️ℹ️ "${key}" does NOT exist in the query string. ignore...`);
      return '';
    }
  }

  /**
   * キー名がクエリ文字列中にあるかどうかを返す
   * 値があるかどうかは見ていない
   *
   * @param  {string}   key キー名
   * @return {boolean}      キーが存在していればtrue
   */
  existsParam(key) {
    return this.allQueryStringHash.some(elm => Object.keys(elm)[0] === key);
  }

  /**
   * リダイレクト先に引き継ぐ新しいパラメータを追加する
   * 無視対象のキー名だと、引き継がれない
   * また、キーの被りも調べていないので、その点にも注意
   *
   * @param {Object} hash {key: value}
   */
  addParam(hash) {
    this.allQueryStringHash.push(hash);
  }

  /**
   * keyを指定して、クエリ文字列内の対応する値を変更する
   *
   * @param {Object} {key: value}  クエリ文字列中のキー : 新しい値
   */
  changeParam(hash) {
    const key = Object.keys(hash)[0];
    const value = hash[key];

    const targetHash = this.getParamHash(key);
    targetHash[key] = value; // 参照元の値が変更される
  }

  /* ****************************************** */
  /* ********** リダイレクト用メソッド群 ********** */
  /* ****************************************** */

  /**
   * 飛び先ディレクトリ部分を変更
   *
   * @param {string} dest 飛び先ディレクトリ＋ファイル部分
   * @example setDest('other/dir/index.html')
   */
  setDest(dest) {
    this.fixedDest = dest;
  }

  /**
   * 飛び先のホスト名（ドメイン名）部分を変更
   *
   * @param {string} host ホスト名
   * @example setHost('www.example.com')
   */
  setHost(host) {
    this.host = host;
  }

  /**
   * 飛び先のプロトコルを変更
   *
   * @param {string} protocol `http:`や`https:`等のプロトコル
   * @example setProtocol('https:')
   */
  setProtocol(protocol) {
    this.protocol = protocol;
  }

  /**
   * 無視指定パラメータを除外して、引き継ぎパラメータを返す
   *
   * @return {Array<Object>} [description]
   */
  getFilteredQueryStringHash() {
    return this.allQueryStringHash.filter((elm) => {
      const key = Object.keys(elm)[0];
      return (this.ignore.indexOf(key) === -1);
    });
  }

  /**
   * クエリパラメータをフィルターして、新たなリダイレクト先のURIを作る
   *
   * @return {string}  リダイレクト先URI
   */
  getRedirectUri() {
    // protocol指定中に `/` があったら除去
    this.protocol = this.protocol.replace(/\//g, '');

    // protocolの末尾に`:`が無ければ補う
    const protocol =
      new RegExp(/:$/).test(this.protocol) ? this.protocol : `${this.protocol}:`;

    // destがコンストラクタ引数もしくは`setDest()`で指定されていたら、そちらを優先する
    const rawDest = (this.fixedDest === '') ? this.getParamValue(this.keyDest) : this.fixedDest;

    // 飛び先。念のためURIデコードし、エスケープとプロコル指定と相対指定を破壊する
    const sanitizedDest =
      decodeURIComponent(rawDest).replace(/\\/g, '').replace(/:\//g, '').replace(/\.\.+/g, '');

    // `//` を見つけたら `/` に変換
    const host_dest = `${this.host}/${sanitizedDest}`.replace(/\/+/g, '/');

    // 無視対象のパラメータを除去したクエリ文字列を作り直す
    const queryString = createQueryString(this.getFilteredQueryStringHash());

    return `${protocol}//${host_dest}?${queryString}`;
  }

  /**
   * リダイレクトを実行する。これがメイン
   */
  redirect() {
    const uri = this.getRedirectUri();
    window.location.replace(uri);
  }
}

/**
 * 引数がまったく空でもQsRedirector本体を`new`できるようにする
 *
 * @param  {Object} [obj={}] QsRedirectorの設定
 * @return {Object}          QsRedirector
 */
const init = (obj = {}) => new QsRedirector(obj);

// default で呼ばれるのは`init`の方
export default init;
