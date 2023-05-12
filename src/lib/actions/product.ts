"use server"

import { zact } from "zact/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { addProductSchema } from "@/lib/validations/product"

export async function checkProductAction(fd: FormData) {
  const name = fd.get("name") as string

  const productWithSameName = await prisma.product.findFirst({
    where: {
      name,
    },
  })

  if (productWithSameName) {
    return {
      error: "Product name already taken",
    }
  }
}

export const addProductAction = zact(
  z.object({
    ...addProductSchema.shape,
    storeId: z.string(),
    images: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
        })
      )
      .optional()
      .default([]),
  })
)(async (input) => {
  const productWithSameName = await prisma.product.findFirst({
    where: {
      name: input.name,
    },
  })

  if (productWithSameName) {
    throw new Error("Product name already taken")
  }

  await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      quantity: input.quantity,
      inventory: input.inventory,
      images: {
        createMany: {
          data: input.images,
        },
      },
      store: {
        connect: {
          id: input.storeId,
        },
      },
    },
  })
})