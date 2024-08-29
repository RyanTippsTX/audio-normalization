import type { APIEvent } from '@solidjs/start/server';

export async function GET({ params }: APIEvent) {
  console.log(`Category: ${params.category}, Brand: ${params.brand}`);
  const products = ['🍎', '🍌', '🍉'];
  return products;
}

export function POST() {
  // ...
}

export function PATCH() {
  // ...
}

export function DELETE() {
  // ...
}
