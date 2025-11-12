import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase, POSTS_BUCKET } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

async function pickImageAsync() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (!result.canceled) return result.assets[0];
  return null;
}

export default function CreatePostScreen() {
  const { session } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors, dark } = useTheme();

  const onPickImage = async () => {
    const asset = await pickImageAsync();
    if (asset) setImage(asset);
  };

  const uploadImage = async () => {
    if (!image) return null;
    const fileExt = image.uri.split('.').pop();
    const filePath = `${session.user.id}/${Date.now()}.${fileExt || 'jpg'}`;
    const resp = await fetch(image.uri);
    const blob = await resp.blob();
    const { data, error } = await supabase.storage
      .from(POSTS_BUCKET)
      .upload(filePath, blob, { contentType: image.mimeType || 'image/jpeg', upsert: true });
    if (error) {
      Alert.alert('Upload error', error.message + '\nEnsure a public bucket named "posts" exists.');
      return null;
    }
    const { data: publicUrl } = supabase.storage.from(POSTS_BUCKET).getPublicUrl(data.path);
    return publicUrl.publicUrl;
  };

  const onPost = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const imageUrl = await uploadImage();
      const authorName = session.user.user_metadata?.name || session.user.email || 'User';
      const { error } = await supabase.from('posts').insert({
        user_id: session.user.id,
        author_name: authorName,
        content_text: text,
        image_url: imageUrl,
      });
      if (error) throw error;
      setText('');
      setImage(null);
      Alert.alert('Posted', 'Your post has been published.');
    } catch (e) {
      Alert.alert('Post error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        placeholder="What's happening?"
        value={text}
        onChangeText={setText}
        multiline
        style={[styles.input, { color: colors.text, borderColor: dark ? '#444' : '#ddd' }]}
        placeholderTextColor={dark ? '#aaa' : '#888'}
      />
      {image && <Image source={{ uri: image.uri }} style={styles.image} />}
      <View style={styles.row}>
        <Button title="Pick Image" onPress={onPickImage} />
        <View style={{ width: 12 }} />
        <Button title={loading ? 'Posting...' : 'Post'} onPress={onPost} disabled={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  image: { height: 240, borderRadius: 8, marginTop: 12 },
  row: { flexDirection: 'row', marginTop: 12 },
});
