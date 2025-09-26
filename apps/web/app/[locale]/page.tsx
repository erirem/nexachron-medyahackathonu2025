import { redirect } from "next/navigation";

export default function Home({ params }: { params: { locale: string } }): never {
  redirect(`/${params.locale}/dashboard`);
}
