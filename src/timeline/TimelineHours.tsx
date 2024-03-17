import range from 'lodash/range';

import React, { useMemo } from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { UnavailableHours } from './Packer';

interface NewEventTime {
    hour: number;
    minutes: number;
    date?: string;
}

export interface TimelineHoursProps {
    start?: number;
    end?: number;
    date?: string;
    format24h?: boolean;
    onBackgroundLongPress?: (timeString: string, time: NewEventTime) => void;
    onBackgroundLongPressOut?: (timeString: string, time: NewEventTime) => void;
    unavailableHours?: UnavailableHours[];
    unavailableHoursColor?: string;
    width: number;
    numberOfDays: number;
    timelineLeftInset?: number;
    testID?: string;
}

const TimelineHours = (props: TimelineHoursProps) => {
    const {
        format24h,
        start = 0,
        end = 24,
    } = props;

    const HOUR_BLOCK_HEIGHT = 60;

    const renderHourLinesAndSlots = useMemo(() => {
        return range(start, end).map(hour => (
            <React.Fragment key={`hour-${hour}`}>
                <Text style={[styles.timeLabel, { top: HOUR_BLOCK_HEIGHT * hour }]}>
                    {format24h ? `${hour}:00` : `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
                </Text>
                <View style={[styles.fullHourLine, { top: HOUR_BLOCK_HEIGHT * hour }]} />
                    {hour !== end && range(1, 4).map(minuteDivision => (
                    <View
                        key={`slot-${hour}-${minuteDivision}`}
                        style={[
                            styles.miniSlot,
                            { top: HOUR_BLOCK_HEIGHT * hour + (HOUR_BLOCK_HEIGHT / 4) * minuteDivision }
                        ]}
                    />
                ))}
            </React.Fragment>
        ));
    }, [start, end, format24h]);

    return (
        <View style={{ paddingTop: 20 }}>
            {renderHourLinesAndSlots}
        </View>
    );
};

const styles = StyleSheet.create({
    timeLabel: {
        position: 'absolute',
        left: 0,
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        paddingLeft: 5,
    },
    fullHourLine: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 2,
        backgroundColor: '#e1e1e1',
    },
    miniSlot: {
        position: 'absolute',
        left: 50,
        width: '75%',
        height: 2,
        backgroundColor: '#cccccc',
    },
});

export default React.memo(TimelineHours);
