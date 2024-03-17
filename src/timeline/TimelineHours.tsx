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
  const TEXT_LINE_HEIGHT = 20; 
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

  return (
    <>
      <TouchableWithoutFeedback onLongPress={handleBackgroundPress} onPressOut={handlePressOut}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>
      {hours.map(({ timeText, time }, index) => {
        return (
          <React.Fragment key={time}>
            <Text
              style={[
                styles.timeLabel,
                { top: HOUR_BLOCK_HEIGHT * index - TEXT_LINE_HEIGHT / 2 }
              ]}>
              {timeText}
            </Text>
            {range(1, 4).map(slot => (
              // Renderiza los slots de 15, 30, 45 minutos
              <View
                key={`timeSlot${time}-${slot}`}
                style={[
                  styles.timeSlot,
                  { top: HOUR_BLOCK_HEIGHT * index + (HOUR_BLOCK_HEIGHT / 4) * slot - 1 }
                ]}
              />
            ))}
            <View
              style={[
                styles.line,
                { top: HOUR_BLOCK_HEIGHT * index }
              ]}
            />
          </React.Fragment>
        );
      })}
      {times(numberOfDays, (index) => <View key={index} style={[styles.verticalLine, {right: (index + 1) * width / numberOfDays}]} />)}
    </>
  );
};

const styles = StyleSheet.create({
  timeLabel: {
    position: 'absolute',
    left: 0,
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    paddingLeft: 5,
  },
  line: {
    position: 'absolute',
    left: 0,
    height: 1,
    backgroundColor: '#e1e1e1',
    width: '100%',
  },
  timeSlot: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  // Estilos adicionales que puedas necesitar
});

export default React.memo(TimelineHours);
