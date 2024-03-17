import range from 'lodash/range';
import times from 'lodash/times';

import React, {useCallback, useMemo, useRef} from 'react';
import {View, Text, TouchableWithoutFeedback, ViewStyle, TextStyle, StyleSheet} from 'react-native';

import constants from '../commons/constants';
import {buildTimeString, calcTimeByPosition, calcDateByPosition} from './helpers/presenter';
import {buildUnavailableHoursBlocks, HOUR_BLOCK_HEIGHT, UnavailableHours} from './Packer';

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
  styles: {[key: string]: ViewStyle | TextStyle};
  width: number;
  numberOfDays: number;
  timelineLeftInset?: number;
  testID?: string;
}

const dimensionWidth = constants.screenWidth;
const EVENT_DIFF = 20;

const TimelineHours = (props: TimelineHoursProps) => {
  const {
    format24h,
    start = 0,
    end = 24,
    date,
    unavailableHours,
    unavailableHoursColor,
    styles,
    onBackgroundLongPress,
    onBackgroundLongPressOut,
    width,
    numberOfDays = 1,
    timelineLeftInset = 0,
    testID,
  } = props;
  const HOUR_BLOCK_HEIGHT = 60; // Altura de un bloque de una hora
  const MINI_SLOT_HEIGHT = HOUR_BLOCK_HEIGHT / 4; // Altura de los slots de 15, 30 y 45 minutos 
  const lastLongPressEventTime = useRef<NewEventTime>();
  // const offset = this.calendarHeight / (end - start);
  const offset = HOUR_BLOCK_HEIGHT;
  const unavailableHoursBlocks = buildUnavailableHoursBlocks(unavailableHours, {dayStart: start, dayEnd: end});

  const hours = useMemo(() => {
    return range(start, end + 1).map(i => {
      let timeText;

      if (i === start) {
        timeText = '';
      } else if (i < 12) {
        timeText = !format24h ? `${i} AM` : `${i}:00`;
      } else if (i === 12) {
        timeText = !format24h ? `${i} PM` : `${i}:00`;
      } else if (i === 24) {
        timeText = !format24h ? '12 AM' : '23:59';
      } else {
        timeText = !format24h ? `${i - 12} PM` : `${i}:00`;
      }
      return {timeText, time: i};
    });
  }, [start, end, format24h]);

  const handleBackgroundPress = useCallback(
    event => {
      const yPosition = event.nativeEvent.locationY;
      const xPosition = event.nativeEvent.locationX;
      const {hour, minutes} = calcTimeByPosition(yPosition, HOUR_BLOCK_HEIGHT);
      const dateByPosition = calcDateByPosition(xPosition, timelineLeftInset, numberOfDays, date);
      lastLongPressEventTime.current = {hour, minutes, date: dateByPosition};

      const timeString = buildTimeString(hour, minutes, dateByPosition);
      onBackgroundLongPress?.(timeString, lastLongPressEventTime.current);
    },
    [onBackgroundLongPress, date]
  );

  const handlePressOut = useCallback(() => {
    if (lastLongPressEventTime.current) {
      const {hour, minutes, date} = lastLongPressEventTime.current;
      const timeString = buildTimeString(hour, minutes, date);
      onBackgroundLongPressOut?.(timeString, lastLongPressEventTime.current);
      lastLongPressEventTime.current = undefined;
    }
  }, [onBackgroundLongPressOut, date]);

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
    <View style={{ paddingTop: 20 }}> {/* Ajuste para comenzar desde un poco más abajo */}
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
    left: 50, // Ajuste según tu diseño
    width: '75%', // Hace que los slots no se extiendan completamente
    height: 2, // Aumenta la altura para hacerlos más visibles
    backgroundColor: '#cccccc',
  },
});

export default React.memo(TimelineHours);
