/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

'use server';

import {promises as fs} from "fs";
import path from "node:path";

export const getVersion = async (): Promise<string> => {
    const file = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    return file.version;
};
