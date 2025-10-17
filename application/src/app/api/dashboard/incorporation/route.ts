import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(_req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;
  const companies = await db.company.findMany({ where: { userId: user.id } });
  if (companies.length === 0) {
    return NextResponse.json({ error: 'No company found for user' }, { status: 404 });
  }
  const companyId = companies[0].id;

  try {
    const incorporation = await db.incorporation.findUnique({ where: { companyId } });
    return NextResponse.json({ incorporation });
  } catch (error) {
    console.error('Failed to fetch incorporation data', error);
    return NextResponse.json({ error: 'Failed to fetch incorporation data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user } = session;
  const body = await req.json();
  const companies = await db.company.findMany({ where: { userId: user.id } });
  if (companies.length === 0) {
    return NextResponse.json({ error: 'No company found for user' }, { status: 404 });
  }
  const companyId = companies[0].id;

  try {
    const incorporation = await db.incorporation.create({ data: { ...body, companyId } });
    return NextResponse.json({ incorporation });
  } catch (error) {
    console.error('Failed to create incorporation data', error);
    return NextResponse.json({ error: 'Failed to create incorporation data' }, { status: 500 });
  }
}
