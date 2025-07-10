/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

import {NextResponse} from 'next/server';
import {promises as fs} from "fs";

export async function GET() {
    const file = await JSON.parse(await fs.readFile(process.cwd() + '/package.json', 'utf8'));
    return NextResponse.json(file.version);
}
