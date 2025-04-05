import { StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

const BannerCard = ({ image, title, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image
            source={image}
            style={styles.image}
            resizeMode="cover"
            onError={(error) => console.log('Image load error:', error)}
        />
        <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: { width: 310, height: 200, marginRight: 0, borderRadius: 10, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    title: { position: 'absolute', bottom: 10, left: 10, color: '#fff', fontWeight: 'bold' },
});

export default BannerCard;