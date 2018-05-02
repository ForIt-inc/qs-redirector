/*
 * テストデータの定義
 */

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
    query: `?dest=yyy/xxx/yyy.html&x=abc`,
    redirect: `${url}/yyy/xxx/yyy.html?x=abc`
  },
  {
    host,
    protocol,
    query: `?dest=?p=`,
    redirect: `${url}/?p=`
  },
  {
    host,
    protocol,
    query: `?dest=&a=aaa&b=bbb`,
    redirect: `${url}/?a=aaa&b=bbb`
  },
  { // ディレクトリ設定が後に配置されている
    host,
    protocol,
    query: `?a=aaa&b=bbb&dest=subdir/`,
    redirect: `${url}/subdir/?a=aaa&b=bbb`
  },
  { // 無視すべきキーがきちんと無視される
    host,
    protocol,
    ignore: ['fil', 'ignore'],
    query: `?fil=ignore&a=aaa&b=bbb&dest=subdir/&ignore=deleteme`,
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
    query: `?a=aaa&b=bbb&dest=subdir/`,
    redirect: `${url}/fixed?a=aaa&b=bbb`
  },
  { // パラメータに空白があってもそのまま出力する
    host,
    protocol,
    query: `?dest=dir/file?xid=sample shop ex`,
    redirect: `${url}/dir/file?xid=sample shop ex`
  },
  { // URIエンコードされていてもそのまま引き渡す
    host,
    protocol,
    query: `?dest=?xid=sample%20shop+ex`,
    redirect: `${url}/?xid=sample%20shop+ex`
  },
];

/*
 * 正常だが少し崩れたデータ
 */
const dataUnusual = [
  { // `&`ではなく`?`でつないである
    host,
    protocol,
    query: `?dest=/xxx/xxx/yyy?x=abc`,
    redirect: `${url}/xxx/xxx/yyy?x=abc`
  },
  { // ディレクトリ指定で、頭に`/`がある
    host,
    protocol,
    query: `?dest=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // 頭の`?`がない
    host,
    protocol,
    query: `dest=/xyz/xxx/yyy?x=abc?y=def`,
    redirect: `${url}/xyz/xxx/yyy?x=abc&y=def`
  },
  { // value部分がURIエンコードしてある(?dだけデコード)
    host,
    protocol,
    query: `?dest=yyy%2Fxxx%2Fyyy?x=%7B%22key%22%3A%22value%7D`,
    redirect: `${url}/yyy/xxx/yyy?x=%7B%22key%22%3A%22value%7D`
  },
  { // protocolに`:`がない
    host,
    protocol: 'http',
    query: `dest=/yyy/xxx/yyy?x=abc?y=def`,
    redirect: `http://${host}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // protocolに不要な`/`がある
    host,
    protocol: 'http://',
    query: `dest=/zzz/xxx/yyy?x=abc?y=def`,
    redirect: `http://${host}/zzz/xxx/yyy?x=abc&y=def`
  },
  { // あちこちに余計な引用符がある
    host,
    protocol,
    query: `?dest=abc/xxx/"y'y"y?x=ab'c?y="def`,
    redirect: `${url}/abc/xxx/%22y'y%22y?x=ab'c&y=%22def`
  },
  { // 無視すべきキー(ignore)が配列ではなく単一の文字列で指定されている
    host,
    protocol,
    ignore: 'fil',
    query: `?fil=ignore&a=aaa&b=bbb&dest=subdir/&ignore=deleteme`,
    redirect: `${url}/subdir/?a=aaa&b=bbb&ignore=deleteme`
  },
  { // スクリプトを渡そうとしているが、`shouldSanitize = false` なので何もしない
    host,
    protocol,
    shouldSanitize: false,
    query: `?dest=/yyy/xxx/yyy&x=abc&tag=<script>alert("hello")</script>`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&tag=<script>alert("hello")</script>`
  },
];

/*
 * クラッキング狙いのデータ
 */
const dataCrack = [
  { // ディレクトリを相対指定している
    host,
    protocol,
    query: `?dest=../\.\./passwd?x=abc?y=def`,
    redirect: `${url}/passwd?x=abc&y=def`
  },
  { // ディレクトリ指定のあちこちに余計な`/`がある
    host,
    protocol,
    query: `?dest=/yyy//xxx///yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // ディレクトリ指定のあちこちに怪しい`\`がある
    host,
    protocol,
    query: `?dest=\\\/yyy/\/xxx/\\//yyy?x=abc?y=def`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&y=def`
  },
  { // URLを入れようとしているので壊す
    host,
    protocol,
    query: `?dest=//http://example.com&x=abc`,
    redirect: `${url}/http/example.com?x=abc`
  },
  { // スクリプトを入れようとしているので壊す
    host,
    protocol,
    query: `?dest=/yyy/xxx/yyy&x=abc&script="</script><script>alert()</script>`,
    redirect: `${url}/yyy/xxx/yyy?x=abc&script=%22/scriptscriptalert/script`
  },
  { // 小細工してURLやスクリプトを入れようとしているので壊す
    host,
    protocol,
    query: `?dest=//http%3A%2F%2Fexample.com&x=abc&script="<script>alert%28%29%3C/script%3E`,
    redirect: `${url}/http/example.com?x=abc&script=%22scriptalert/script`
  },
];

export { dataNormal, dataUnusual, dataCrack };
