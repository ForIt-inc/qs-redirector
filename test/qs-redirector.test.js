import test from 'ava';
import Redirector from 'src/qs-redirector';

const host = 'example.com';
const protocol = 'https:';
const url = `${protocol}//${host}`;

/*
 * 正常系データ
 */
const dataNormal = [
  {
    host,
    protocol,
    query: `?d=yyy/xxx/yyy.html&x=abc`,
    redirect: `${url}/yyy/xxx/yyy.html?x=abc`
  },
  {
    host,
    protocol,
    query: `?d=?p=`,
    redirect: `${url}/?p=`
  },
  {
    host,
    protocol,
    query: `?d=&a=aaa&b=bbb`,
    redirect: `${url}/?a=aaa&b=bbb`
  },
  { // ディレクトリ設定が後に配置されている
    host,
    protocol,
    query: `?a=aaa&b=bbb&d=subdir/`,
    redirect: `${url}/subdir/?a=aaa&b=bbb`
  },
  { // 無視すべきキーがきちんと無視される
    host,
    protocol,
    ignore: ['fil', 'ignore'],
    query: `?fil=ignore&a=aaa&b=bbb&d=subdir/&ignore=deleteme`,
    redirect: `${url}/subdir/?a=aaa&b=bbb`
  },
  { // ディレクトリ設定キーの変更がきちんと反映される
    host,
    protocol,
    keyDest: 'dir',
    query: `?a=aaa&b=bbb&dir=subdir/`,
    redirect: `${url}/subdir/?a=aaa&b=bbb`
  },
  { // 飛び先ディレクトリ以下が指定されている
    host,
    protocol,
    dest: 'fixed',
    query: `?a=aaa&b=bbb&d=subdir/`,
    redirect: `${url}/fixed?a=aaa&b=bbb`
  },
  { // パラメータに空白があってもそのまま出力する
    host,
    protocol,
    query: `?d=dir/file?xadid=mtg onlineshop_afi_ab_1101_200_200 ex`,
    redirect: `${url}/dir/file?xadid=mtg onlineshop_afi_ab_1101_200_200 ex`
  },
  { // URIエンコードされていてもそのまま引き渡す
    host,
    protocol,
    query: `?d=?xid=sample%20onlineshop_200_200+ex`,
    redirect: `${url}/?xid=sample%20onlineshop_200_200+ex`
  }
];

/*
 * 正常だが少し崩れたデータ
 */
const dataAbnormal = [
  { // `&`ではなく`?`でつないである
    host,
    protocol,
    query: `?d=/yyy/xxx/yyy?x=abc`,
    redirect: `${url}/yyy/xxx/yyy?x=abc`
  },
  { // ディレクトリ指定で、頭に`/`がある
    host,
    protocol,
    query: `?d=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // 頭の`?`がない
    host,
    protocol,
    query: `d=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // value部分がURIエンコードしてある(?dだけデコード)
    host,
    protocol,
    query: `?d=yyy%2Fxxx%2Fyyy?x=%7B%22key%22%3A%22value%7D`,
    redirect: `${url}/yyy/xxx/yyy?x=%7B%22key%22%3A%22value%7D`
  },
  { // スクリプトを渡そうとしているが、`shouldSanitize = false` なので何もしない
    host,
    protocol,
    shouldSanitize: false,
    query: `?d=/yyy/xxx/yyy&x=abc&tag=<script>alert()</script>`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&tag=<script>alert()</script>`
  },
  { // protocolに`:`がない
    host,
    protocol: 'http',
    query: `d=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `http://${host}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // protocolに不要な`/`がある
    host,
    protocol: 'http://',
    query: `d=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `http://${host}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // 無視すべきキーが配列ではなく文字列で指定されている
    host,
    protocol,
    ignore: 'fil',
    query: `?fil=ignore&a=aaa&b=bbb&d=subdir/&ignore=deleteme`,
    redirect: `${url}/subdir/?a=aaa&b=bbb&ignore=deleteme`
  },
];

/*
 * クラッキング狙いのデータ
 */
const dataCrack = [
  { // ディレクトリを相対指定している
    host,
    protocol,
    query: `?d=../\.\./passwd?x=abc?y=def`,
    redirect: `${url}/passwd?x=abc&y=def`
  },
  { // ディレクトリ指定のあちこちに余計な`/`がある
    host,
    protocol,
    query: `?d=/yyy//xxx///yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // ディレクトリ指定のあちこちに怪しい`\`がある
    host,
    protocol,
    query: `?d=\\\/yyy/\/xxx/\\//yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // URLを入れようとしているので壊す
    host,
    protocol,
    query: `?d=//http://example.com&x=abc`,
    redirect: `${url}/http/example.com?x=abc`
  },
  { // スクリプトを入れようとしているので壊す
    host,
    protocol,
    query: `?d=/yyy/xxx/yyy&x=abc&script="</script><script>alert()</script>`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&script="/scriptscriptalert/script`
  },
  { // 小細工してURLやスクリプトを入れようとしているので壊す
    host,
    protocol,
    query: `?d=//http%3A%2F%2Fexample.com&x=abc&script="<script>alert%28%29%3C/script%3E`,
    redirect: `${url}/http/example.com?x=abc&script="scriptalert/script`
  }
];

/* ********* テスト開始 ********* */

test('☑️ 正しいリダイレクト先URIを生成できる', (t) => {
  const result = dataNormal.map((elm) => {
    const r = new Redirector(elm);
    return r.getRedirectUri(elm);
  });
  const expected = dataNormal.map(elm => elm.redirect);

  t.deepEqual(result, expected);
});

test('☑️ 少し形式がおかしくても正しいリダイレクト先を生成できる', (t) => {
  const result = dataAbnormal.map((elm) => {
    const r = new Redirector(elm);
    return r.getRedirectUri(elm);
  });
  const expected = dataAbnormal.map(elm => elm.redirect);

  t.deepEqual(result, expected);
});

test('❕ 危険そうな文字を削除してリダイレクト先を生成できる', (t) => {
  const result = dataCrack.map((elm) => {
    const r = new Redirector(elm);
    return r.getRedirectUri(elm);
  });
  const expected = dataCrack.map(elm => elm.redirect);

  t.deepEqual(result, expected);
});

/* ****** パラメータ操作のテスト ***** */
test('☑️ クエリ文字中の特定パラメータの存在を確かめられる', (t) => {
  const paramKeys = ['x', 'y']; // `y` は存在しないので、ログでその旨を報告される
  const r = new Redirector(dataNormal[0]);
  const result = paramKeys.map(elm => r.existsParam(elm));
  const expected = [true, false];

  t.deepEqual(result, expected);
});

test('☑️ クエリ文字中の特定パラメータの値を取得できる', (t) => {
  const paramKeys = ['x', 'y'];
  const r = new Redirector(dataNormal[0]);
  const result = paramKeys.map(elm => r.getParamValue(elm));
  const expected = ['abc', ''];

  t.deepEqual(result, expected);
});

test('☑️ クエリ文字中の特定パラメータの値を追加できる', (t) => {
  const data = dataNormal[0];
  const newParam = { extra: 'exValue' };
  const r = new Redirector(data);
  r.addParam(newParam);
  const result = r.getRedirectUri();
  const expected = `${data.redirect}&extra=exValue`;

  t.is(result, expected);
});

test('☑️ クエリ文字中の特定パラメータの値を変更できる', (t) => {
  const data = dataNormal[0];
  const newParam = { x: 'xyz' };
  const r = new Redirector(data);
  r.changeParam(newParam);
  const result = r.getRedirectUri();
  const expected = `${data.redirect.replace(/x=abc/, 'x=xyz')}`;

  t.is(result, expected);
});

test('☑️ protocol, host, destの値を変更できる', (t) => {
  const opts = { protocol: 'http:', host: 'example.net', dest: 'otherdir/page' };
  const expected = 'http://example.net/otherdir/page?x=abc';

  const r = new Redirector(dataNormal[0]);
  r.setProtocol(opts.protocol);
  r.setHost(opts.host);
  r.setDest(opts.dest);
  const result = r.getRedirectUri();

  t.is(result, expected);
});
