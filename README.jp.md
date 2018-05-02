
## QS Redirector Sample

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)]()


与えられたURLクエリ文字列（URLクエリパラメータ）から、選択的にパラメータを引き継ぐリダイレクトURIを作成します。また、クエリ文字列を簡単に操作する機能も備えています。

## 特徴

限定的な状況用に作成したリダイレクト機構です。

元々、サーバ側スクリプトで動くリダイレクト用ページが存在していて、そこに新たなURLクエリを文字列を解釈する処理を追加することになったが……

* 元のリダイレクトページは簡単に編集できない
* 新規作成できるのは、静的なHTMLのページだけ

という条件に対応するために作成しました。

以下の特徴があります。

* HTMLのページを用意すればリダイレクトできる
* URLクエリを簡単に編集できる
* 自ページとは別のドメインにもリダイレクトできる
    * オープンリダイレクト脆弱性に一定の配慮

## インストール（ビルド方法）

[npm](https://www.npmjs.com/) には登録していませんので、直接ダウンロードしてご利用ください。

このスクリプトを改造したり、添付のサンプルコードを動かしたりするには、開発用のパッケージのインストールとトランスパイル（ビルド）が必要になります。以下の手順をご参照ください。

1. 本プロジェクトのソースコード一式をダウンロード
2. ターミナルを起動して、本プロジェクトのルートディレクトリへ移動
3. ターミナルで `npm install` を実行
    * `npm install` するのは、ダウンロード後の最初の1回だけで大丈夫です

あとは、下記コマンドをターミナルで打ちトランスパイルをして、 `./dist` に出力されるJavaScriptを任意のディレクトリに置いて、HTMLから &lt;script&gt; タグで呼び出してください。

* `npm run build:develop` - 開発ビルド。コード短縮なし
* `npm run build:product` - 自動テスト + 本番ビルド（コードを短縮）

### ️️💡 そういう面倒なこと抜きで使うには？

スクリプトを改造する予定がない場合は、上記 `npm xxx` のような手順は不要です。

予め本番ビルドをしたコードを [sample/js/qs-redirector.js](sample/js/qs-redirector.js) として添付してあります。このファイルをコピーすれば、ビルド不要で **そのままご利用になれます。**

### 💡 サンプルコードを動かしてみるには？

`npm install`が完了した状態で `npm start`と打つと、自動的にサーバとブラウザが起動して、実際の動作を確認できます。

サーバの停止はターミナルで`Ctrl-C`です。

`npm start` 時に自動で開く [sample](sample) ディレクトリ内には、以下のようなサンプルがあります。詳しくはそれぞれのHTMLのソースをご確認ください。

* [qs-redirector.html](sample/qs-redirector.html) - シンプルなリダイレクトの例。リダイレクト先をクエリ文字列で与えられています
* [fixed-qs-redirector.html](sample/fixed-qs-redirector.html) - 上記のシンプルな例とほぼ同じ。外部のサイトにリダイレクトするようファイル内で指定しています
* [ex-qs-redirector.html](sample/ex-qs-redirector.html) - 外部のサイトをクエリ文字列内で選択して安全にリダイレクトする例
* [afb-qs-redirector.html](sample/afb-qs-redirector.html) - afbのcookieを保存後にリダイレクトする例


## 基本的な使い方

最初に `new QsRedirector({オプション})` してください。

* ex. `const r = new QsRedirector({})` - すべてデフォルトの設定で使う
    * cf. `const r = new QsRedirector()` でも大丈夫です
* ex. `const r = new QsRedirector({host: 'example.net'})` - 飛び先ホストを指定

### メインの関数

* `redirect()` - 与えられた設定でリダイレクトを実行する
    * `window.location.replace()` でリダイレクトします
    * ex. `r.redirect();`
* `getRedirectUri()` - 与えられた設定からリダイレクト先のURIを生成する
    * 別の方法でリダイレクトしたい時や、飛び先を確認したい時に使用してください
    * ex. `var uri = r.getRedirectUri();`

#### HTML サンプル
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>redirect</title>
    <!-- 任意の場所に置いた本スクリプトを呼び出す -->
    <script src="./qs-redirector.js"></script>
    <script>
    // リダイレクト設定。特に設定しなければ、すべてデフォルト設定になる
    var rOpts = {};

    var r = new QsRedirector(rOpts);

    // リダイレクト実行
    r.redirect()
    // `?dest=`で指定されたディレクトリにリダイレクト
    // http://example.com/redirect.html?dest=other/dir/&a=123 で到達していたら、
    // http://example.com/other/dir/?a=123 にリダイレクトされる
    </script>
</head>
<body>
</body>
</html>

```
💡 単純にリダイレクトし直すだけなら、 **以上の知識だけ** で使えます。

---

💡 この先、少し込み入った話になります。 **リダイレクトの際に、何かを実行をしたい場合に** お読みください。

### クエリ文字列操作の関数

現在のページに到達時点のクエリ文字列を読み取り、以下の操作で編集できます。

* `existsParam(key)` - クエリ文字列にkeyが存在するかどうか調べる
* `getParamValue(key)` - クエリ文字列からkeyに対応する値を取り出す
* `addParam({ key: value })` - リダイレクト後のクエリ文字列に `key=value` を追加する
* `changeParam({ key: newValue })` - クエリ文字列に存在する `key=value` を変更する

### リダイレクト設定の関数

後述のオプションの指定や、クエリ文字列中の`keyDest`で指定したキーの値を無視して、以下の値を変更します。

* `setProtocol(string)` - オプションのprotocolの値を変更します
* `setHost(string)` - オプションのhostの値を変更します
* `setDest(string)` - ディレクトリとファイルの値を変更します

```javascript
// 例
var r = new QsRedirector();
r.setProtocol('https:');
r.setHost('example.net');
r.setDest('dir/index.html');
// https://example.net/dir/index.html?全てのクエリ文字列 にリダイレクト
r.redirect();
```

### 例１- 同じドメインのページへリダイレクト

* 元々のリダイレクトページへのリンク
    * `http://example.com/lp/page?abc=123`
* 上記へリダイレクトするこのリダイレクタ(redirector.html)へのリンク
    * `http://example.com/redirector.html?dest=lp/page&abc=123&xyz=999`
        * `d=lp/page` がリダイレクト先指定
        * `abc=123` はリダイレクト先が処理するクエリ文字列（引き継ぐ）
        * `xyz=999` が新たに処理をしなければならないクエリ文字列（引き継がない）

#### コード(例1)
```html
<!-- このスクリプトを呼び出す -->
<script src="./qs-redirector.js/"></script>

<script>
    // http://example.com/redirector.html?dest=lp/page&abc=123&xyz=999

    // `ignore` で指定した`xyz=999` は引き継がない
    // リダイレクト先指定の `dest=...` はデフォルトで引き継がない
    const param = { ignore: ['xyz'] };
    const r = new QsRedirector(param);

    // URLクエリ文字列 `xyz=999` を解釈して何かを行なう
    const valueXyz = r.getParamValue('xyz');
    doSomething(valueXyz); // 何らかの処理 `doSomething()` を実行

    // リダイレクト実行 http://example.com/lp/page?abc=123 へ
    r.redirect();
</script>
```

### 例２ - 別ドメインのページへリダイレクト

例１と同じ内容を `http://example.com` で受けて、`https://example.net` に飛ばす

#### コード(例2)

```html
<script>
    // http://example.com/redirector.html?dest=lp/page&abc=123&xyz=999

    const param = {
        ignore: ['xyz'],
        protocol: 'https:',
        host: 'example.net' // 外部の hostname を指定
    };

    const r = new QsRedirector(param);
    // URLクエリ文字列 `xyz=999` を解釈して何かを行なう
    const valueXyz = r.getParamValue('xyz');
    doSomething(valueXyz); // 何らかの処理 `doSomething()` を実行

    // リダイレクト実行 http://example.net/lp/page?abc=123 へ
    r.redirect();
</script>
```

## オプション

基本的に **オプション無指定** = **デフォルトのまま** 実行できます。細かい制御をする際に以下のオプションを指定して、 `new QsRedirector({...})` してください。

* keyDest (String) - リダイレクト先のディレクトリを指定するクエリ文字列のキー名。無指定なら `xxx.html?dest=somewhere` の `dest` が使われます
    * default: `'dest'`
    * example: `{ keyDest: 'dir' }`
        * `xxx.html?dir=somewhere` となっている `dir` 部分をリダイレクト先ディレクトリとして読み取ります
* ignore (Array<Sting>) - リダイレクト先には渡さないクエリ文字列のキー名
    * default: `[]`
    * example: `{ ignore: ['abc', 'deleteme'] }`
* query (String) - クエリ文字列すべて。主にテスト時に使用。無指定なら現在のURIから自動取得
    * default: `window.location.search`
    * example: `{ query: '?abc=123&xyz=zyx' }`
* protocol (String) - リダイレクトのプロトコル（スキーム）。無指定なら現在のURIから自動取得
    * default: `window.location.protocol`
    * example: `{ protocol: 'https:' }`
* host (String) - リダイレクト先のホスト名。無指定なら現在のURIから自動取得
    * default: `window.location.hostname`
    * example: `{ host: 'example.com' }`
* shouldSanitize (Boolean) - クエリ文字列内の`<>()`を除去し、二重引用符をURLエンコードするかどうか。無指定なら`true`になり除去
    * default: `true`
    * example: `{ shouldSanitize: false }`

※ `shouldSanitze` フラグでの一部文字列除去は、リダイレクト先の脆弱性を突かれにくくするための「気休め」です。sanitize の役割はあまり期待しないでください。

### セキュリティ上の注意

️️❗ `protocol` や `host` などのリダイレクト先を現在のサイトから変更する設定は、クエリ文字列に与えられた文字列そのものを使わないようにしてください。脆弱性に繋がります。


💀 危険な例

```JavaScript
/*
 * 悪意のある第三者が以下のURIをばらまいたと想定
 * http://example.com/redirect?dest=dir/&host=danger.danger&x=abc
 * `danger.danger` は危険なドメイン
 * ️️
 * 見た目は本来の目的地の `http://example.com/` へのリンクなのに、
 * 危険な `http://danger.danger/` に連れて行かれる！
 */
const param = { ignore: 'type' };
const r = new QsRedirector(param);

// クエリ文字列から`host`の値そのものを取得する ️
// ❗ ここが危険
const host = r.getParamValue('host');
// リダイレクト先ホストを `danger.danger` に設定
r.setHost(host);

// 危険なサイト`http://danger.danger`へリダイレクト実行
r.redirect();
```

👌 安全な例

```JavaScript
/*
 * http://example.com/redirect?dest=dir/&type=net&x=abc で到達
 * example.net/dir または example.com/dir にリダイレクトしたい
 * この例は example.net を意図
 */

const param = { ignore: 'type' };
const r = new QsRedirector(param);

// hostのパターンを設定
const hosts = { com: 'example.com', net: 'example.net' };
// クエリ文字列から`type`の値を取得する。この例では `net` という文字列
const type = r.getParamValue('type');
// リダイレクト先ホストを設定。この例では `example.net` が選択される
r.setHost(hosts[type]);
// `hosts` に存在しない想定外の`type`なら無視され、危険なリダイレクトを防ぐ

// リダイレクト実行。現在のホストへ
r.redirect();
```

## 主要 npm scripts

* `npm run build:develop` - `./src`のソースを`./dist`へ開発用にトランスパイル
* `npm run build:product` - `./src`のソースを`./dist`へ本番用にトランスパイル
* `npm test` - `./test`内のファイル内容に従って、自動テスト
    * [AVA](https://github.com/avajs/ava) を利用しています
* `npm start` - サンプル確認用のサーバ起動
    * [Browsersync](https://browsersync.io/) を利用しています

## ライセンス

[Mit License](https://opensource.org/licenses/MIT) に基づいてご提供します。

## 作者

株式会社フォーイット http://www.for-it.co.jp/
