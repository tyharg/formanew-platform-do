import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const incorporation = await db.incorporation.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ incorporation });
  } catch (error) {
    console.error('Failed to update incorporation data', error);
    return NextResponse.json({ error: 'Failed to update incorporation data' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.incorporation.delete({ where: { id } });
    return NextResponse.json({ message: 'Incorporation data deleted successfully' });
  } catch (error) {
    console.error('Failed to delete incorporation data', error);
    return NextResponse.json({ error: 'Failed to delete incorporation data' }, { status: 500 });
  }
}
