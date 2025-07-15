/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {LocationProps} from "@/lib/PlantData/PlantData";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getLocationNameById(locations: LocationProps[] | null, locationId: number) {
    if (!locations) return '-';
    const location = locations.find(location => location.id === locationId);
    return location ? location.name : '-';
}

export function formatLastWatered(lastWatered: string | null) {
    if (!lastWatered) return null;

    const date = new Date(lastWatered);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    return `${hours}:${minutes} Uhr | ${day}.${month}.${year}`;
}

export function formatScheduleTime(scheduleTime: string | undefined, scheduleFrequency: string | undefined) {
    if (!scheduleTime || !scheduleFrequency) return null;

    // Define days of the week in German
    const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

    const [scheduledHour, scheduledMinute] = scheduleTime.split(':').map(Number);
    const now = new Date();
    const currentDay = now.getDay(); // 0-6, where 0 is Sunday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let displayDay;
    let displayTime = `${scheduleTime} Uhr`;

    if (scheduleFrequency === 'daily') {
        if (currentHour > scheduledHour || (currentHour === scheduledHour && currentMinute > scheduledMinute)) {
            displayDay = daysOfWeek[(currentDay + 1) % 7]; // Next day
        } else {
            displayDay = daysOfWeek[currentDay];
        }
    } else if (scheduleFrequency === 'weekly') {
        displayDay = 'Montag';
    } else {
        return '-';
    }

    return `${displayDay} | ${displayTime}`;
}

export function getTimeStamp(): string {
    const now = new Date();

    // German days of the week and months arrays
    const daysOfWeek = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const dayOfWeek = daysOfWeek[now.getDay()];
    const month = months[now.getMonth()];
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    // Construct the formatted string
    return `${dayOfWeek}, ${day}. ${month} ${year}, ${hour}:${minute} Uhr`;
}

export function downloadLogic(data: any, filename: string) {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${now.toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
