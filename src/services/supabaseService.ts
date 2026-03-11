import { supabase } from '../lib/supabase';
import { Product, Order, User, Review, Question, Notification } from '../types';

export const supabaseService = {
  // Products
  async getProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data as Product[];
  },

  async upsertProduct(product: Product) {
    const { data, error } = await supabase.from('products').upsert(product).select();
    if (error) throw error;
    return data[0] as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Order[];
  },

  async createOrder(order: Order) {
    const { data, error } = await supabase.from('orders').insert(order).select();
    if (error) throw error;
    return data[0] as Order;
  },

  async updateOrder(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Order;
  },

  // Users / Profiles
  async getUsers() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data as User[];
  },

  async createProfile(user: User) {
    const { data, error } = await supabase.from('profiles').insert(user).select();
    if (error) throw error;
    return data[0] as User;
  },

  async updateProfile(id: string, updates: Partial<User>) {
    const { data, error } = await supabase.from('profiles').upsert({ id, ...updates }).select();
    if (error) throw error;
    return data[0] as User;
  },

  // Notifications
  async getNotifications(userId: string) {
    const { data, error } = await supabase.from('notifications').select('*').eq('userId', userId).order('createdAt', { ascending: false });
    if (error) throw error;
    return data as Notification[];
  },

  async createNotification(notification: Notification) {
    const { data, error } = await supabase.from('notifications').insert(notification).select();
    if (error) throw error;
    return data[0] as Notification;
  },

  async markNotificationRead(id: string) {
    const { error } = await supabase.from('notifications').update({ isRead: true }).eq('id', id);
    if (error) throw error;
  }
};
