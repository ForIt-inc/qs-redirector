import nodeResolve  from 'rollup-plugin-node-resolve';
import commonjs     from 'rollup-plugin-commonjs';
import babel        from 'rollup-plugin-babel';
import uglify       from 'rollup-plugin-uglify';

// `build:product` のときは true。それ以外はfalseになる
const isProductMode = process.env.BUILD_ENV === "production";
export default {
  // トランスパイル対象のファイル。import対象をここから辿っていき結合する
  input: './src/qs-redirector.js',
  // トランスパイル・結合後の出力先ディレクトリ・ファイル名
  output: {
    file: './dist/qs-redirector.js',
    // 結合出力フォーマット。`iife` はブラウザ向けのフォーマット。コード全体を無名関数として括る
    format: "iife",
    // 固有の名前。`iife`で括ったとき、必要に応じてこの名前が使われる
    name: "QsRedirector"
  },
  // ↓ここからコードの変換の処理設定。順番に処理される
  plugins: [
    // npmモジュールを `./node_modules` から `import` で読み込む
    nodeResolve({ jsnext: true }),
    // CommonJSモジュールをES6に変換
    commonjs(),
    // BabelでES5に変換。Babelの設定は、`./.babelrc`に書いてある
    babel({ exclude: 'node_modules/**' }),
    // `build:product` 時に、ソースコードを圧縮する
    isProductMode ? uglify({ output: { quote_style: 3 } }) : ""
  ]
};
