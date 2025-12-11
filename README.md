# 架空の EC サイト制作（サーバーサイド）

## はじめに

本 EC サイト制作は、ソフトバンク入社に向けて、学習した Nuxt と express を使って成果物を作る目的で行うものである。<br>
フロントエンドに Nuxt、バックエンドに express を利用する。

このリポジトリでは、express を利用したバックエンド処理のデータを管理する。<br>
本サイトのバックエンド処理は、express で API エンドポイントを開発する。

## 技術スタック

node.js（express）

## データベース設計

### 商品テーブル（item）

| id              | name   | price | context | img1   | img2   | img3   | stock | category | tag   | release_date | active |
| --------------- | ------ | ----- | ------- | ------ | ------ | ------ | ----- | -------- | ----- | ------------ | ------ |
| int （primary） | string | int   | string  | string | string | string | int   | string   | Array | Date         | int    |

### ユーザーテーブル（User）

| id            | name   | email  | password | birthday | sex    | age |
| ------------- | ------ | ------ | -------- | -------- | ------ | --- |
| int (primary) | string | string | string   | Date     | string | int |

## API エンドポイント

### 商品関連の API

#### 全ての商品を取得する API

URL： /item/

#### id を元に一つの商品を取得する API

URL： /item/:id

#### 指定したカテゴリーに属する商品を全て取得する API

URL： /item/:cat

#### 指定したタグに属する商品を全て取得する API

URL： /item/:tag

#### 商品を追加する API

URL： /item/create/
投稿内容はリクエストボディで追加

#### 商品を更新する API

URL： /item/update/:id

#### 商品を削除する API

URL： /item/delete/:id

### ユーザー関連の API

#### 全てのユーザーを取得する API

URL： /user/

#### id を元に一つのユーザーを取得する API

URL: /user/:id

#### ユーザーを登録する API

URL： /user/create/
登録内容はリクエストボディで追加

#### ユーザーを更新する API

URL： /user/update/:id

#### ユーザーを削除する API

URL： /user/delete/:id

#### ユーザーがログインする API

URL： /user/login/

### 検索関連

#### 絞り込み検索 API

URL： /search/
クエリパラメーターは複数設定想定
クエリパラメーターで取得したキーと値を元に絞り込みを行う

以下は想定されるパラメーター

- keyword キーワード部分一致検索
- category カテゴリ一致
- tag タグ配列
- sort ソート条件に変換
- price ※例：1000 円以下、5000 円以下 など上限条件として扱う
