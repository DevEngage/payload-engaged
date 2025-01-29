import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
export const Page = async ({ params, searchParams }) => {
  const payload = await getPayload({
    config: configPromise,
  })
  return <div>test ${payload?.config?.collections?.length}</div>
}

export default Page
