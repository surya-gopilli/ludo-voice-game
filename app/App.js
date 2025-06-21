import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import io from 'socket.io-client';
import RtcEngine from 'react-native-agora';
import { SERVER_URL, AGORA_APP_ID, AGORA_TOKEN } from './config';

const socket = io(SERVER_URL);

export default function App() {
  const [dice, setDice] = useState(1);
  const [engine, setEngine] = useState(null);
  const [joinedVoice, setJoinedVoice] = useState(false);

  // Listen for dice events from other players
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('diceRolled', (value) => {
      setDice(value);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Initialize Agora Voice Chat
  useEffect(() => {
    const initVoice = async () => {
      const rtc = await RtcEngine.create(AGORA_APP_ID);
      await rtc.enableAudio();

      rtc.addListener('JoinChannelSuccess', () => {
        console.log('Voice chat connected');
        setJoinedVoice(true);
      });

      await rtc.joinChannel(AGORA_TOKEN, 'ludo-room', null, 0);
      setEngine(rtc);
    };

    initVoice();
  }, []);

  const rollDice = () => {
    const value = Math.floor(Math.random() * 6) + 1;
    setDice(value);
    socket.emit('rollDice', value);
  };

  const leaveVoiceChat = async () => {
    if (engine) {
      await engine.leaveChannel();
      setJoinedVoice(false);
      Alert.alert("Voice chat left");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎲 Ludo Game</Text>
      <Text style={styles.diceValue}>Dice: {dice}</Text>

      <TouchableOpacity onPress={rollDice} style={styles.button}>
        <Text style={styles.buttonText}>Roll Dice</Text>
      </TouchableOpacity>

      <View style={styles.voiceContainer}>
        <Text>{joinedVoice ? '🎤 Voice Connected' : 'Connecting voice...'}</Text>
        {joinedVoice && (
          <Button title="Leave Voice Chat" color="red" onPress={leaveVoiceChat} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5fcff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  diceValue: {
    fontSize: 38,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  voiceContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
