'use server'

import { revalidateTag } from 'next/cache';

export async function revalidateProposals() {
  revalidateTag('proposals');
}

