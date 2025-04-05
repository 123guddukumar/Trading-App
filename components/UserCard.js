import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function UserCard({ user, onEdit, onDelete }) {
    return (
        <View style={globalStyles.card}>
            <Text>Name: {user.name || 'N/A'}</Text>
            <Text>Email: {user.email}</Text>
            <View style={globalStyles.cardActions}>
                <TouchableOpacity onPress={onEdit}>
                    <Text style={globalStyles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete}>
                    <Text style={globalStyles.link}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}