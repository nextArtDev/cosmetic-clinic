/**
 * /v4 content data — verbatim copy of chat-clone/pegasus-clinic's
 * src/lib/clinic-data.ts. All assets are namespaced under /v4/images.
 * Kept frontend-only (no db imports) so this port stays a mock until it
 * is wired to the real Prisma backend.
 */

export type Treatment = {
  id: string;
  number: string;
  title: string;
  english: string;
  category: "surgery" | "skin";
  image: string;
  tags: string[];
  description: string;
  detail: string;
  price: string;
  duration: string;
  downtime: string;
  risks: string;
};

export const treatments: Treatment[] = [
  {
    id: "double-eyelid", number: "01", title: "埋没二重", english: "Double eyelid", category: "surgery",
    image: "/v4/images/treatment-01.jpg", tags: ["一重", "理想の目元"],
    description: "理想の二重をデザインします。\n二重幅の広さや形など細かく一緒に確認いたします。",
    detail: "メスを使わず、医療用の細い糸でまぶたを留めて二重のラインをつくる施術です。一人ひとりのまぶたの状態やお顔全体のバランスを確認し、ご希望を丁寧にお伺いしながらデザインをご提案します。まずはカウンセリングでご相談ください。",
    price: "49,800", duration: "約20〜30分", downtime: "腫れ・内出血が1〜2週間程度生じることがあります。", risks: "腫れ、内出血、左右差、感染、糸の露出など。効果や回復には個人差があります。",
  },
  {
    id: "laser", number: "02", title: "シミ取りレーザー", english: "Clear & luminous skin", category: "skin",
    image: "/v4/images/treatment-02.jpg", tags: ["肌のくすみ", "頑固なシミ", "肝斑"],
    description: "特定の波長で様々なシミに対応する\nレーザー治療を行っております。",
    detail: "肌診断をもとに、シミの種類や深さに合わせた治療をご提案します。レーザーがメラニン色素に反応し、気になるシミにアプローチ。治療後の紫外線対策やスキンケアまで丁寧にサポートします。肝斑など、レーザー治療が適さない場合もあるため、医師の診察が必要です。",
    price: "5,500", duration: "約15〜30分", downtime: "赤みや薄いかさぶたが1〜2週間程度生じることがあります。", risks: "赤み、腫れ、色素沈着、色素脱失、熱傷など。診察のうえ適応を判断します。",
  },
  {
    id: "hyaluronic", number: "03", title: "ヒアルロン酸注入", english: "Naturally, beautifully you", category: "surgery",
    image: "/v4/images/treatment-03.jpg", tags: ["ほうれい線などのシワ", "涙袋・あごの輪郭形成"],
    description: "シワやたるみを改善することで、\n自然な印象の若々しい輪郭を目指します。",
    detail: "お顔のバランスや骨格を考慮し、気になる部位にヒアルロン酸を注入する施術です。ほうれい線、頬、涙袋、あごなど、自然な仕上がりを大切にしながら、あなたらしい美しさを引き出すことを目指します。",
    price: "39,800", duration: "約15〜30分", downtime: "腫れ・内出血が数日〜2週間程度生じることがあります。", risks: "腫れ、内出血、しこり、左右差、アレルギー、血管閉塞など。効果には個人差があります。",
  },
];

export const reasons = [
  { title: "経験豊富な院長が\n丁寧にカウンセリング", english: "A conversation, not just a consultation.", image: "/v4/images/reason-01.jpg", description: "大手美容外科で7年間院長を務めた医師が、カウンセリングから施術、アフターケアまで全て責任を持って担当します。初めての方でも安心してご相談いただけるよう、時間をかけてじっくりとお話を伺います。" },
  { title: "あなたの気持ちに寄り添う\n経験豊かなスタッフ", english: "Thoughtful care, every step of the way.", image: "/v4/images/reason-02.jpg", description: "当院のスタッフは全員、美容医療で3年以上のキャリアを持っています。「こんなこと聞いてもいいのかな…？」と思うような小さな疑問にも、親身になってお答えします。" },
  { title: "一人ひとりの肌に合わせた\n先進的な美容医療", english: "The right treatment. Just for you.", image: "/v4/images/reason-03.jpg", description: "様々なお悩みに対応できるよう、医療機器を取り揃えています。お肌の状態を丁寧に確認し、あなたに合った治療をご提案。無理のない、自分らしい美しさを一緒に見つけましょう。" },
];

export const reviews = [
  "初めてのクリニックで緊張しましたが、先生やスタッフの方が皆丁寧で優しく、安心して施術を受けられました。自分の目に合った理想の二重にしていただき、大大大満足です！",
  "看護師、カウンセラー、先生ともに非常に優しいです。悩みや理想をしっかり聞いて丁寧なシミュレーションをしてくださり、大満足の二重になりました。",
  "肌診断機で隠れたシミも確認でき、院長が明確な治療法をアドバイスしてくれるので、何をすべきか分からない方にカウンセリングは特におすすめです。",
  "ヒアルロン酸、ボトックス、レーザーなど幅広くお願いしています。いつも丁寧に相談に乗ってくださり、安心してお任せできます。",
];

export const faqs = [
  { question: "美容クリニックが初めてでも大丈夫ですか？", answer: "もちろんです。初めての方にも安心してお越しいただけるよう、カウンセリングの時間を大切にしています。お悩みやご希望を伺い、施術の内容・費用・リスクについて分かりやすくご説明いたします。ご相談だけでもお気軽にお越しください。" },
  { question: "カウンセリング当日に施術を受けられますか？", answer: "施術内容や当日の予約状況により、カウンセリング当日の施術が可能です。ご希望の場合は予約時にお知らせください。診察の結果、お肌の状態などによっては別日をご案内することもございます。" },
  { question: "どの施術が自分に合うか分かりません。", answer: "施術を決めずにご相談いただいて大丈夫です。医師がお悩み、お肌の状態、ご希望のダウンタイムやご予算などを伺い、適切な選択肢をご提案いたします。" },
  { question: "支払い方法には何がありますか？", answer: "現金、各種クレジットカード、医療ローンをご用意しています。医療ローンには審査があります。詳しいご利用条件はカウンセリング時にスタッフへお問い合わせください。" },
];

export const articles = [
  { id: "first-visit", date: "2025.06.27", category: "クリニックについて", title: "はじめての美容医療。あなたらしい美しさを見つけるために。", image: "/v4/images/reason-01.jpg", body: "美容医療をもっと身近に、もっと安心して。PEGASUS CLINICでは、お一人おひとりとの対話を何よりも大切にしています。カウンセリングでは、ご希望だけでなく、不安なことや疑問も遠慮なくお話しください。施術を受けるかどうかは、ご説明に納得されてからお決めいただけます。まずはご自身の気持ちを聞かせていただくことが、最初の一歩です。" },
  { id: "skin-care", date: "2025.06.24", category: "スキンケア", title: "素肌に、自信を。毎日を変えるスキンケアの小さな習慣。", image: "/v4/images/treatment-02.jpg", body: "健やかな肌づくりの基本は、優しい洗顔、十分な保湿、そして毎日の紫外線対策です。季節やお肌の状態に合わせてケアを見直してみましょう。シミやくすみなど、ホームケアだけでは解決しにくいお悩みは、医師に相談することも一つの選択肢です。お肌に合うケアを一緒に考えていきます。" },
  { id: "natural-beauty", date: "2025.06.20", category: "美容医療", title: "自然な仕上がりのために、私たちが大切にしていること。", image: "/v4/images/treatment-03.jpg", body: "私たちが目指すのは、誰かの美しさではなく、あなた本来の美しさ。お顔全体のバランスを見ながら、必要な治療を必要な分だけご提案します。仕上がりのイメージを共有し、施術後の経過やアフターケアまで丁寧にご説明いたします。" },
];

export const caseExamples = [
  { id: "under-eye", title: "裏ハムラ", subtitle: "自然で明るい目元へ", category: "eyes", image: "/v4/images/case-01.png", number: "No.33", price: "268,200円（税込）", description: "目の下の脂肪で膨らんでいる部分の脂肪を凹みに移動して固定することで、膨らみと凹みを同時に整える方法です。", risks: "腫れ・目がゴロゴロする・内出血・違和感：1〜2週間程度", treatment: "カウンセリングで相談したい" },
  { id: "chin", title: "ヒアルロン酸注入 / あご", subtitle: "美しい横顔のバランス", category: "contour", image: "/v4/images/case-02.png", number: "No.56", price: "66,400円（税込）", description: "ヒアルロン酸1CCをあごに注入。ヒアルロン酸を注入することで窪みを改善し、ボリュームアップや輪郭形成を目指す施術です。", risks: "腫れ・内出血・違和感：数日〜1週間程度。血管閉塞などのリスクもあります。", treatment: "ヒアルロン酸注入" },
  { id: "tear-bag", title: "ヒアルロン酸注入 / 涙袋", subtitle: "あなたらしい、優しい目元", category: "eyes", image: "/v4/images/case-03.png", number: "No.55", price: "19,800円（税込）〜", description: "ヒアルロン酸0.3CCを涙袋に注入。目元のバランスを確認しながら、自然なボリューム感を目指します。", risks: "腫れ・内出血・違和感：数日〜1週間程度。血管閉塞などのリスクもあります。", treatment: "ヒアルロン酸注入" },
];

export const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
export const bookingTreatments = ["カウンセリングで相談したい", ...treatments.map((t) => t.title), "ボトックス", "医療脱毛", "その他"];

export function localDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
