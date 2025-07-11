/*
 * Copyright (c) 2024 All rights reserved.
 * This code is the intellectual property of Louis Kauer [dev-Laky].
 */

'use client';

import {useEffect, useState} from 'react';
import {getLocations, getPlants, getPlantsStatus, LocationProps, PlantProps} from '@/lib/PlantData/PlantData';

export const usePlantData = (interval: number) => {
    const [plantData, setPlantData] = useState<PlantProps[]>([]);
    const [locationData, setLocationData] = useState<LocationProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchPlantData = async () => {
        try {
            const data = await getPlants();

            // pass location data down
            const locations = await getLocations();
            setLocationData(locations);

            // Initialize the status field and add location name for each plant
            const plantsWithStatusAndLocation = await Promise.all(
                data.map(async (plant: PlantProps) => {
                    try {
                        const status = await getPlantsStatus(plant.id);
                        return {
                            ...plant,
                            status
                        };
                    } catch (error) {
                        console.error(error);
                        return {
                            ...plant,
                            status: 'unknown'
                        };
                    }
                })
            );
            setPlantData(plantsWithStatusAndLocation);
        } catch (err: any) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlantData().then(r => r); // Fetch plant data on component mount
        const intervalId = setInterval(fetchPlantData, interval); // Update data every 'interval' milliseconds

        return () => clearInterval(intervalId); // Cleanup interval on unmount or when interval changes
    }, [interval]);

    return {plantData, locationData, loading, error};
};
