import { Container, Breadcrumbs, Markdown } from "@/components/ui";

export default function StaticPage({ title, md }: { title: string; md: string }) {
  return (
    <Container>
      <Breadcrumbs items={[{ label: title }]} />
      <article className="mx-auto max-w-3xl py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
        <Markdown md={md} className="mt-6" />
      </article>
    </Container>
  );
}
