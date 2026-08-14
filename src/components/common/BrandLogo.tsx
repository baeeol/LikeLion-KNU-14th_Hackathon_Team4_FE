import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

type BrandLogoProps = {
  width?: number;
};

export function BrandLogo({width = 124}: BrandLogoProps) {
  const height = Math.round(width * 0.3);

  return (
    <View style={[styles.frame, {width, height}]}> 
      <Image
        source={require('../../assets/images/roubal-logo.png')}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {overflow: 'hidden'},
  image: {width: '100%', height: '100%'},
});
