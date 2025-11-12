import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { supabase, AVATARS_BUCKET } from '../lib/supabase';
import { useTheme } from '@react-navigation/native';
import dayjs from 'dayjs';

function PostItem({ item }) {
  return (
    <View style={styles.post}>
      <View style={styles.header}>
        <Text style={styles.time}>{dayjs(item.created_at).format('MMM D, HH:mm')}</Text>
      </View>
      {item.content_text ? <Text style={styles.text}>{item.content_text}</Text> : null}
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : null}
    </View>
  );
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [posts, setPosts] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { colors, dark } = useTheme();

  const user = session?.user;
  const name = user?.user_metadata?.name || user?.email || 'User';
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Keep local avatar URL in sync with session metadata when it changes
  useEffect(() => {
    setAvatarUrl(user?.user_metadata?.avatar_url || null);
  }, [user?.user_metadata?.avatar_url]);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) return result.assets[0];
    return null;
  };

  const onChangeAvatar = async () => {
    if (!session) return;
    try {
      setAvatarLoading(true);
      const asset = await pickImageAsync();
      if (!asset) return;
      const fileExt = asset.uri.split('.').pop();
      const filePath = `${session.user.id}/avatar_${Date.now()}.${fileExt || 'jpg'}`;
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const { data, error } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(filePath, blob, {
          contentType: asset.mimeType || 'image/jpeg',
          upsert: true,
        });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(data.path);
      // Add cache-busting query param so the Image fetches the fresh upload immediately
      const freshUrl = `${publicUrl.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: freshUrl },
      });
      if (updateError) throw updateError;
      // Immediately reflect the change in UI without waiting for session refresh
      setAvatarUrl(freshUrl);
      Alert.alert('Avatar updated', 'Your profile picture has been updated.');
    } catch (e) {
      Alert.alert('Avatar error', e.message + '\nEnsure a public bucket named "avatars" exists.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.email, { color: dark ? '#fff' : '#666' }]}>{user?.email}</Text>
        </View>
        <View style={{ gap: 8 }}>
          <Button title={avatarLoading ? 'Updating...' : 'Change Avatar'} onPress={onChangeAvatar} disabled={avatarLoading} />
          <Button title="Logout" onPress={signOut} />
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostItem item={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12, backgroundColor: '#eee' },
  avatarFallback: { backgroundColor: '#ddd' },
  name: { fontSize: 18, fontWeight: '600' },
  email: {},
  post: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  text: { fontSize: 16, marginBottom: 8 },
  image: { height: 240, borderRadius: 8 },
  time: {},
});
