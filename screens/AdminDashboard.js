import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
    Image,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [banners, setBanners] = useState([]);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('free'); // 'free', 'premium', or 'banner'
    const [file, setFile] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    // Fetch users, courses, and banners on mount
    useEffect(() => {
        fetchUsers();
        fetchCourses();
        fetchBanners();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch users');
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch courses');
        }
    };

    const fetchBanners = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/banners');
            const data = await response.json();
            setBanners(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch banners');
        }
    };

    const pickFile = () => {
        ImagePicker.launchImageLibrary({ mediaType: type === 'banner' ? 'photo' : 'video' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled file picker');
            } else if (response.error) {
                Alert.alert('Error', 'File picker error');
            } else {
                setFile(response.assets[0]);
            }
        });
    };

    const handleUpload = async () => {
        if (!title || !file) {
            Alert.alert('Error', 'Please provide a title and select a file');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
        });

        try {
            const response = await fetch('http://localhost:3000/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Upload successful');
                setTitle('');
                setFile(null);
                type === 'banner' ? fetchBanners() : fetchCourses();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Upload failed');
        }
    };

    const handleEditUser = async (user) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
            if (response.ok) {
                Alert.alert('Success', 'User updated');
                fetchUsers();
            } else {
                Alert.alert('Error', 'Failed to update user');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update user');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/users/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                Alert.alert('Success', 'User deleted');
                fetchUsers();
            } else {
                Alert.alert('Error', 'Failed to delete user');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to delete user');
        }
    };

    const handleEditItem = async (item, isBanner) => {
        try {
            const response = await fetch(
                `http://localhost:3000/admin/${isBanner ? 'banners' : 'courses'}/${item.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                }
            );
            if (response.ok) {
                Alert.alert('Success', `${isBanner ? 'Banner' : 'Course'} updated`);
                isBanner ? fetchBanners() : fetchCourses();
                setEditingItem(null);
            } else {
                Alert.alert('Error', `Failed to update ${isBanner ? 'banner' : 'course'}`);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to update ${isBanner ? 'banner' : 'course'}`);
        }
    };

    const handleDeleteItem = async (id, isBanner) => {
        try {
            const response = await fetch(
                `http://localhost:3000/admin/${isBanner ? 'banners' : 'courses'}/${id}`,
                {
                    method: 'DELETE',
                }
            );
            if (response.ok) {
                Alert.alert('Success', `${isBanner ? 'Banner' : 'Course'} deleted`);
                isBanner ? fetchBanners() : fetchCourses();
            } else {
                Alert.alert('Error', `Failed to delete ${isBanner ? 'banner' : 'course'}`);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to delete ${isBanner ? 'banner' : 'course'}`);
        }
    };

    const renderUser = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>Name: {item.name}</Text>
            <Text style={styles.itemText}>Email: {item.email}</Text>
            <Text style={styles.itemText}>Org Code: {item.orgCode}</Text>
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => {
                        const updatedName = prompt('Enter new name', item.name);
                        if (updatedName) {
                            handleEditUser({ ...item, name: updatedName });
                        }
                    }}
                >
                    <Icon name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
                    <Icon name="delete" size={24} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCourse = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>Title: {item.title}</Text>
            <Text style={styles.itemText}>Type: {item.type}</Text>
            <Image source={{ uri: item.url }} style={styles.thumbnail} />
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => {
                        setEditingItem(item);
                        const updatedTitle = prompt('Enter new title', item.title);
                        if (updatedTitle) {
                            handleEditItem({ ...item, title: updatedTitle }, false);
                        }
                    }}
                >
                    <Icon name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id, false)}>
                    <Icon name="delete" size={24} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBanner = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>Title: {item.title}</Text>
            <Image source={{ uri: item.url }} style={styles.thumbnail} />
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => {
                        setEditingItem(item);
                        const updatedTitle = prompt('Enter new title', item.title);
                        if (updatedTitle) {
                            handleEditItem({ ...item, title: updatedTitle }, true);
                        }
                    }}
                >
                    <Icon name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id, true)}>
                    <Icon name="delete" size={24} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Upload Course/Banner</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'free' && styles.selectedType]}
                        onPress={() => setType('free')}
                    >
                        <Text>Free Course</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'premium' && styles.selectedType]}
                        onPress={() => setType('premium')}
                    >
                        <Text>Premium Course</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'banner' && styles.selectedType]}
                        onPress={() => setType('banner')}
                    >
                        <Text>Banner</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={pickFile}>
                    <Text style={styles.buttonText}>Select File</Text>
                </TouchableOpacity>
                {file && <Text style={styles.fileName}>{file.fileName}</Text>}
                <TouchableOpacity style={styles.button} onPress={handleUpload}>
                    <Text style={styles.buttonText}>Upload</Text>
                </TouchableOpacity>
            </View>

            {/* Users Section */}
            <Text style={styles.sectionTitle}>Users</Text>
            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />

            {/* Courses Section */}
            <Text style={styles.sectionTitle}>Courses</Text>
            <FlatList
                data={courses}
                renderItem={renderCourse}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />

            {/* Banners Section */}
            <Text style={styles.sectionTitle}>Banners</Text>
            <FlatList
                data={banners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    uploadSection: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    typeButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    selectedType: {
        backgroundColor: '#ddd',
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fileName: {
        marginVertical: 5,
        color: '#333',
    },
    list: {
        marginBottom: 20,
    },
    item: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
        elevation: 1,
    },
    itemText: {
        fontSize: 14,
        color: '#333',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginVertical: 5,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
});