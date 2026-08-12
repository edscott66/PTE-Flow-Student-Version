import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CustomLoaderProps {
  message?: string;
  size?: number;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ message, size = 120 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const opacityAnim = pulseAnim.interpolate({
    inputRange: [1, 1.05],
    outputRange: [1, 0.8]
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/icon2.png')}
        style={[
          styles.image,
          { 
            width: size, 
            height: size,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim
          }
        ]}
        resizeMode="contain"
      />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    borderWidth: 3,
    borderColor: '#c09c32',
    borderRadius: 8,
  },
  text: {
    color: '#64748B',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CustomLoader;
