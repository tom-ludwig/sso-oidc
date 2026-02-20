/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

'use server';

import {promises as fs} from "fs";
import path from "node:path";

export interface ScheduleProps {
    time: string;
    duration: number;
    frequency: string;
    paused: boolean;
}

export interface HardwarePathsProps {
    openPath: string;
    closePath: string;
}

export interface PlantProps {
    id: number;
    name: string;
    locationId: number;
    lastWatered: string | null;
    status: boolean | null;
    hardwarePaths: HardwarePathsProps | null;
    schedule: ScheduleProps | null;
    locationData: LocationProps[] | null;
}

export interface CreatePlantProps {
    name: string;
    locationId: number;
    hardwarePaths: HardwarePathsProps;
    schedule: null;
}

export interface UpdatePlantProps {
    name: string;
    locationId: number;
    hardwarePaths: HardwarePathsProps;
}

export interface UpdateScheduleProps {
    id: number;
    time: string | undefined;
    duration: number | undefined;
    frequency: string | undefined;
    paused: boolean;
}

export interface LocationProps {
    id: number;
    name: string;
    plantData: PlantProps[] | null;
}

export interface CreateLocationProps {
    name: string;
}

export const getVersion = async (): Promise<string> => {
    const file = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    return file.version;
};

export const getLocations = async () => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/locations`);

    if (!response.ok) {
        const errorMessage =
            `Error getting locations(http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export const getPlants = async () => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants`);

    if (!response.ok) {
        const errorMessage =
            `Error getting plants(http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }

    return await response.json();
};

export const getPlantsStatus = async (plantId: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}/water/status`);

    if (response.ok) {
        return true;
    }

    // Caution: 404 is a valid status code here, because it means the plant is not currently watering
    // this ignores the fact that there might be other errors
    if (response.status === 404) {
        return false;
    }

    // Return null if status is not 200 or 404 --> Error
    const errorMessage =
        `Error fetching status for plant ${plantId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
    throw new Error(errorMessage);
}

export const updatePlantContent = async (plantId: number, plantData: UpdatePlantProps) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantData),
        });

    if (!response.ok) {
        const errorMessage =
            `Error updating plant ${plantId} content(http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const updatePlantSchedule = async (plantId: number, scheduleData: ScheduleProps) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}/schedule`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData),
        });

    if (!response.ok) {
        const errorMessage =
            `Error updating plant ${plantId} schedule(http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const deleteSchedule = async (plantId: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}/schedule`,
        {
            method: 'DELETE',
        });

    if (!response.ok) {
        const errorMessage =
            `Error deleting plant ${plantId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const startWatering = async (plantId: number, duration: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}/water/start`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({duration}),
        });

    if (!response.ok) {
        const errorMessage =
            `Error starting watering for plant ${plantId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const stopWatering = async (plantId: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}/water/stop`,
        {
            method: 'POST',
        });

    if (!response.ok) {
        const errorMessage =
            `Error stopping watering for plant ${plantId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const createPlant = async (plantData: CreatePlantProps) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantData),
        });

    if (!response.ok) {
        const errorMessage =
            `Error creating plant (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const deletePlant = async (plantId: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/plants/${plantId}`,
        {
            method: 'DELETE',
        });

    if (!response.ok) {
        const errorMessage =
            `Error deleting plant ${plantId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const deletePlants = async (plantIds: number[]) => {
    for (const plantId of plantIds) {
        await deletePlant(plantId);
    }
}

export const createLocation = async (locationData: CreateLocationProps) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/locations`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(locationData),
        });

    if (!response.ok) {
        const errorMessage =
            `Error creating location (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}

export const deleteLocation = async (locationId: number) => {
    const response = await fetch(
        `http://${process.env.H2GROW_SERVICE_HOSTNAME}:${process.env.H2GROW_SERVICE_PORT}/locations/${locationId}`,
        {
            method: 'DELETE',
        });

    if (!response.ok) {
        const errorMessage =
            `Error deleting location ${locationId} (http status): ${response.status} ${response.statusText} | url: ${response.url}`;
        throw new Error(errorMessage);
    }
}