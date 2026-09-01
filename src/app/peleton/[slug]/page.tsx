import { redirect } from "next/navigation"
export default async function PeletonSlugRedirect({ params }: { params: Promise<{slug:string}> }){
  const { slug } = await params
  redirect(`/tim/${slug}`)
}
