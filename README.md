# 架空の EC サイト制作（サーバーサイド）

## はじめに

本 EC サイト制作は、ソフトバンク入社に向けて、学習した Nuxt と express を使って成果物を作る目的で行うものである。<br>
フロントエンドに Nuxt、バックエンドに express を利用する。

このリポジトリでは、express を利用したバックエンド処理のデータを管理する。<br>
本サイトのバックエンド処理は、express で API エンドポイントを開発する。

## 技術スタック

node.js（express）
MongoDB

## データベース設計

### 商品テーブル（item）

| id              | name   | price | context | img1   | img2   | img3   | stock | category | tag   | release_date | active | isDeleted | createdBy |
| --------------- | ------ | ----- | ------- | ------ | ------ | ------ | ----- | -------- | ----- | ------------ | ------ | --------- | --------- |
| int （primary） | string | int   | string  | string | string | string | int   | string   | Array | Date         | int    | int       | ObjectId  |

### ユーザーテーブル（User）

| id            | name   | email  | password | refreshToken | birthday | sex    | age |
| ------------- | ------ | ------ | -------- | ------------ | -------- | ------ | --- |
| int (primary) | string | string | string   | string       | Date     | string | int |

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

URL： /item/create/<br>
投稿内容はリクエストボディで追加<br>
アクセストークン認証ミドルウェア（authMiddleware）と ID 認証ミドルウェア（authorizeSelfForItem）を導入

#### 商品を更新する API

URL： /item/update/:id<br>
アクセストークン認証ミドルウェア（authMiddleware）と ID 認証ミドルウェア（authorizeSelfForItem）を導入

#### 商品を削除する API

URL： /item/delete/:id<br>
アクセストークン認証ミドルウェア（authMiddleware）と ID 認証ミドルウェア（authorizeSelfForItem）を導入

#### 商品をソフトデリートする API

URL：/item/soft-delete/:id<br>
「isDeleted」の値を変更（0 -> 1 に変更）<br>
アクセストークン認証ミドルウェア（authMiddleware）と ID 認証ミドルウェア（authorizeSelfForItem）を導入

#### 絞り込み検索 API

URL： /item/search/<br>
クエリパラメーターは複数設定想定<br>
クエリパラメーターで取得したキーと値を元に絞り込みを行う

以下は想定されるパラメーター

- keyword キーワード部分一致検索
- category カテゴリ一致
- tag タグ配列
- sort ソート条件に変換
- price ※例：1000 円以下、5000 円以下 など上限条件として扱う

### ユーザー関連の API

#### 全てのユーザーを取得する API

URL： /user/

#### id を元に一つのユーザーを取得する API

URL: /user/:id<br>
アクセストークン認証ミドルウェア（authMiddleware）と ID 認証ミドルウェア（authorizeSelf）を導入

#### ユーザーを登録する API

URL： /user/create/<br>
登録内容はリクエストボディで追加<br>
パスワードはハッシュ化する

#### ユーザーを更新する API

URL： /user/update/:id<br>
更新できる情報を制限 -> ["name", "birthday", "sex", "age"]<br>
アクセストークン認証ミドルウェア（authMiddleware）とユーザー ID 認証ミドルウェア（authorizeSelf）を導入

#### ユーザーを削除する API

URL： /user/delete/:id<br>
アクセストークン認証ミドルウェア（authMiddleware）とユーザー ID 認証ミドルウェア（authorizeSelf）を導入

#### ユーザーがログインする API

URL： /user/login/<br>
ログイン時にアクセストークンを発行する。有効期限は 30 分。<br>
また、リフレッシュトークンも発行する。有効期限は 1 週間。<br>
リフレッシュトークンはハッシュ化して、データベースに保存。<br>
cookie にリフレッシュトークン（refreshToken）とユーザー ID（userId）を保存する。

#### Refresh API

URL： /user/refresh/<br>
リフレッシュトークンを発行して、新しいアクセストークンを発行

#### ログアウト API

URL：/user/logout/<br>
ログアウト時に、cookie の情報を削除（refreshToken と userId）

### 管理画面関連の API

#### ログイン API

URL： /admin_user/login/<br>
ログイン時にアクセストークンを発行する。有効期限は 30 分。<br>
また、リフレッシュトークンも発行する。有効期限は 2 週間。<br>
リフレッシュトークンはハッシュ化して、データベースに保存。<br>
cookie にリフレッシュトークン（adminRefreshToken）とユーザー ID（adminUserId）を保存する。

#### Refresh API

URL： /admin_user/refresh/<br>
リフレッシュトークンを発行して、新しいアクセストークンを発行

#### ログアウト API

URL：/admin_user/logout/<br>
ログアウト時に、cookie の情報を削除（adminRefreshToken と adminUserId）
