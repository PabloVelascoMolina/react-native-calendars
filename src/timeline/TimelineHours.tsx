import range from 'lodash/range';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimelineHours = ({ start = 0, end = 24, format24h = true }) => {
  const HOUR_BLOCK_HEIGHT = 60; // Altura de cada bloque de hora
  
  const renderHoursAndMiniSlots = useMemo(() => {
    return range(start, end).map(hour => {
      // Convertir la hora a formato 12h si format24h es falso
      const hourLabel = format24h ? `${hour}:00` : `${hour % 12 || 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`;
      
      // Los mini slots representan 15, 30, y 45 minutos
      const miniSlots = range(1, 4).map(minuteDivision => {
        const topPosition = HOUR_BLOCK_HEIGHT * hour + (HOUR_BLOCK_HEIGHT / 4) * minuteDivision;
        
        return (
          <View
            key={`mini-slot-${hour}-${minuteDivision}`}
            style={[styles.miniSlot, { top: topPosition }]}
          />
        );
      });
      
      return (
        <React.Fragment key={hour}>
          <Text style={[styles.hourLabel, { top: HOUR_BLOCK_HEIGHT * hour - 10 }]}>
            {hourLabel}
          </Text>
          <View style={[styles.hourLine, { top: HOUR_BLOCK_HEIGHT * hour }]} />
          {miniSlots}
        </React.Fragment>
      );
    });
  }, [start, end, format24h]);

  return (
    <View style={styles.container}>
      {renderHoursAndMiniSlots}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 20, // Ajuste según necesidad
    },
    hourLabel: {
        position: 'absolute',
        left: 0,
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        paddingLeft: 5,
    },
    hourLine: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 1,
        backgroundColor: '#000', // Hora completa más visible
    },
    miniSlot: {
        position: 'absolute',
        left: 50, // Ajustar según el diseño
        width: '75%', // Los mini slots ocupan menos ancho
        height: 1,
        backgroundColor: '#aaa', // Mini slot menos visible
    },
});

export default React.memo(TimelineHours);
