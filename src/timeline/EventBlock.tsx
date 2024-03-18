import XDate from 'xdate';
import React, { useCallback, useMemo } from 'react';
import { View, Text, TextStyle, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';

export interface Event {
  id?: string;
  start: string;
  end: string;
  title: string;
  summary?: string;
  color?: string;
  borderColor?: string;
  textColor?: string;
}

export interface PackedEvent extends Event {
  index: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface EventBlockProps {
  index: number;
  event: PackedEvent;
  onPress: (eventIndex: number) => void;
  renderEvent?: (event: PackedEvent) => JSX.Element;
  format24h?: boolean;
  styles: {[key: string]: ViewStyle | TextStyle};
}

const TEXT_LINE_HEIGHT = 17;
const EVENT_DEFAULT_COLOR = '#add8e6';

const EventBlock = (props: EventBlockProps) => {
  const { index, event, renderEvent, onPress, format24h } = props;

  // Asumiendo que tienes estilos adicionales pasados mediante props, como "styles.event"
  const customStyles = StyleSheet.create({
    eventContainer: {
      borderRadius: 5,
      borderLeftWidth: 5,
      borderLeftColor: event.borderColor ? event.color : EVENT_DEFAULT_COLOR,
      padding: 8,
      paddingLeft: 10,
      backgroundColor: event.color ? event.color : EVENT_DEFAULT_COLOR,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    eventTitle: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 2,
      color: event.textColor ? event.textColor : '#555',
    },
    eventSummary: {
      fontSize: 12,
      color: event.textColor ? event.textColor : '#555',
    },
    eventTimes: {
      fontSize: 12,
      marginTop: 4,
      color: event.textColor ? event.textColor : '#555',
    }
  });

  const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
  const formatTime = format24h ? 'HH:mm' : 'hh:mm A';

  const eventStyle = useMemo(() => ({
    left: event.left,
    height: event.height,
    width: event.width,
    top: event.top,
  }), [event]);

  const _onPress = useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={_onPress} style={[customStyles.eventContainer, eventStyle]}>
      {renderEvent ? (
        renderEvent(event)
      ) : (
        <View>
          <Text numberOfLines={1} style={customStyles.eventTitle}>
            {event.title || 'Event'}
          </Text>
          {numberOfLines > 1 ? (
            <Text numberOfLines={numberOfLines - 1} style={customStyles.eventSummary}>
              {event.summary || ' '}
            </Text>
          ) : null}
          {numberOfLines > 2 ? (
            <Text style={customStyles.eventTimes} numberOfLines={1}>
              {new XDate(event.start).toString(formatTime)} - {new XDate(event.end).toString(formatTime)}
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default EventBlock;
