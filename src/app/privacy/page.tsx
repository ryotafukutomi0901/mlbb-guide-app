import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-xl font-bold">プライバシーポリシー</h1>
      <Card className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>
          本サイト「MLBB攻略ラボ」(以下「当サイト」)は、広告配信のためにGoogleを含む第三者配信事業者を利用します。
          第三者配信事業者はCookieを使用して、ユーザーが当サイトや他のサイトに過去にアクセスした際の情報に基づいて広告を配信します。
        </p>
        <p>
          Googleが広告配信にCookieを使用することにより、当サイトや他のサイトへのアクセス情報に基づいて、Googleやそのパートナーが適切な広告を表示しています。
          ユーザーは
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-primary hover:underline"
          >
            広告設定
          </a>
          でパーソナライズ広告を無効にできます。
        </p>
        <p>
          当サイトは、アクセス解析のためにアクセス情報を収集する場合があります。収集した情報は特定の個人を識別するものではありません。
        </p>
        <p className="text-xs text-text-muted/70">
          ※このページはひな形です。運営者情報・お問い合わせ先・実際の広告/解析ツールの導入状況に合わせて内容を見直してください。
        </p>
      </Card>
    </div>
  );
}
