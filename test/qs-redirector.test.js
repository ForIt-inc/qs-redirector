import test from 'ava';
import Redirector from 'src/qs-redirector';
import { dataNormal, dataUnusual, dataCrack } from './data/qs-redirector.data';

/* ********* テスト用のユーティリティ ********* */

/**
 * リダイレクタを使って指示通りのURIを生成する
 *
 * @param {Object} elm  リダイレクタに渡す引数オブジェクト
 */
const getResult = (elm) => {
  const r = new Redirector(elm);
  return r.getRedirectUri(elm);
};

/* ********* テスト開始 ********* */

test('正しいリダイレクト先URIを生成できる', (t) => {
  dataNormal.forEach((elm, index) => {
    const result = getResult(elm);
    const expected = elm.redirect;
    t.is(result, expected, `️️❗ failed at "dataNormal" #${index}`);
  });
});

test('少し形式がおかしくても正しいリダイレクト先を生成できる', (t) => {
  dataUnusual.forEach((elm, index) => {
    const result = getResult(elm);
    const expected = elm.redirect;
    t.is(result, expected, `️️❗ failed at "dataUnusual" #${index}`);
  });
});

test('危険そうな文字を削除してリダイレクト先を生成できる', (t) => {
  dataCrack.forEach((elm, index) => {
    const result = getResult(elm);
    const expected = elm.redirect;
    t.is(result, expected, `️️❗ failed at "dataCrack" #${index}`);
  });
});

/* ****** パラメータ操作のテスト ***** */

test('クエリ文字中の特定パラメータの存在を確かめられる', (t) => {
  const data = [
    { paramKey: 'x', expected: true },
    // 存在しないパラメータのテスト。テストは通るが、console.log()でその旨を報告される
    { paramKey: 'y', expected: false }
  ];

  data.forEach((elm) => {
    const r = new Redirector(dataNormal[0]);
    const result = r.existsParam(elm.paramKey);

    t.is(result, elm.expected);
  });
});

test('クエリ文字中の特定パラメータの値を取得できる', (t) => {
  const data = [
    { paramKey: 'x', expected: 'abc' },
    { paramKey: 'y', expected: '' }
  ];

  data.forEach((elm) => {
    const r = new Redirector(dataNormal[0]);
    const result = r.getParamValue(elm.paramKey);

    t.is(result, elm.expected);
  });
});

test('クエリ文字中の特定パラメータの値を追加できる', (t) => {
  const data = dataNormal[0];
  const newParam = { extra: 'exValue' };
  const expected = `${data.redirect}&extra=exValue`;

  const r = new Redirector(data);
  r.addParam(newParam);
  const result = r.getRedirectUri();

  t.is(result, expected);
});

test('クエリ文字中の特定パラメータの値を変更できる', (t) => {
  const data = dataNormal[0];
  const newParam = { x: 'xyz' };
  const expected = `${data.redirect.replace(/x=abc/, 'x=xyz')}`;

  const r = new Redirector(data);
  r.changeParam(newParam);
  const result = r.getRedirectUri();

  t.is(result, expected);
});

test('protocol, host, destの値を変更できる', (t) => {
  const opts = {
    protocol: 'http:',
    host: 'example.net',
    dest: 'otherdir/page'
  };
  const expected = 'http://example.net/otherdir/page?x=abc';

  const r = new Redirector(dataNormal[0]);
  r.setProtocol(opts.protocol);
  r.setHost(opts.host);
  r.setDest(opts.dest);
  const result = r.getRedirectUri();

  t.is(result, expected);
});

test('protocol, host, destの値が空文字またはundefinedなら無視する', (t) => {
  const defaultParam = dataNormal[0];
  const data = [
    { opts: { protocol: '', host: '', dest: '' }, expected: true },
    { opts: { protocol: undefined, host: undefined, dest: undefined }, expected: true }
  ];

  const r = new Redirector(defaultParam);

  data.forEach((elm) => {
    const { opts, expected } = elm;

    r.setProtocol(opts.protocol);
    r.setHost(opts.host);
    r.setDest(opts.dest);
    const result = r.getRedirectUri() === defaultParam.redirect;

    t.is(result, expected);
  });
});

/* ********** あまり考えにくい状況だが念のために ********** */

test('複数のリダイレクタが共存できる', (t) => {
  const data = dataNormal[0];
  const newParam = { x: 'xyz' };


  const r1 = new Redirector(data);
  const result1 = r1.getRedirectUri();
  const expected1 = data.redirect;

  if (result1 !== expected1) {
    t.fail();
  }

  const r2 = new Redirector(data);
  r2.changeParam(newParam);
  const result2 = r2.getRedirectUri();
  const expected2 = `${data.redirect.replace(/x=abc/, 'x=xyz')}`;

  if (result2 !== expected2) {
    t.fail();
  }

  t.not(result1, result2);
});
