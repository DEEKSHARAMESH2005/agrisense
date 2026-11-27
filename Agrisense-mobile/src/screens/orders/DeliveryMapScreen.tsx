import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { Order } from '../../types';
import { Header } from '../../components/common/Header';
import {
  MapPin,
  Truck,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Compass,
} from 'lucide-react-native';

interface DeliveryMapScreenProps {
  route: { params: { order: Order } };
  navigation: any;
}

export const DeliveryMapScreen: React.FC<DeliveryMapScreenProps> = ({
  route,
  navigation,
}) => {
  const { order } = route.params;

  const handleExternalNav = () => {
    Alert.alert(
      'External Navigation Handoff',
      `Launching system map route to ${order.deliveryAddress}. (Simulated Hand-off to Google Maps / Apple Maps)`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Tracking ${order.id}`}
        subtitle="Simulated Highway Route Visualizer"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Demo banner */}
        <View style={styles.demoBanner}>
          <AlertCircle size={15} color="#0369A1" />
          <Text style={styles.demoBannerText}>
            Simulated Live Telematics: Showing real-time transit between farm cluster and buyer destination.
          </Text>
        </View>

        {/* Visual Map Canvas / Highway Corridor */}
        <View style={styles.mapCanvas}>
          {/* Map Grid Pattern background */}
          <View style={styles.gridOverlay}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          {/* Highway Route Path Representation */}
          <View style={styles.routeContainer}>
            {/* Farm Origin Pin */}
            <View style={styles.pinWrapper}>
              <View style={styles.originPin}>
                <Text style={styles.pinText}>FARM</Text>
              </View>
              <Text style={styles.pinLocationLabel}>Nashik Hub</Text>
            </View>

            {/* Simulated Road Highway line with moving Truck */}
            <View style={styles.roadLine}>
              <View style={styles.dashedCenter} />
              {/* Truck Icon on highway */}
              <View style={styles.truckBubble}>
                <Truck size={18} color="#FFFFFF" />
              </View>
            </View>

            {/* Destination Pin */}
            <View style={styles.pinWrapper}>
              <View style={styles.destPin}>
                <MapPin size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.pinLocationLabel}>Buyer Home</Text>
            </View>
          </View>

          {/* Live Speed & Distance Badge */}
          <View style={styles.telemetryOverlay}>
            <View style={styles.telemItem}>
              <Clock size={12} color="#D1FAE5" />
              <Text style={styles.telemText}>ETA: 2h 45m</Text>
            </View>
            <View style={styles.telemDivider} />
            <View style={styles.telemItem}>
              <Compass size={12} color="#D1FAE5" />
              <Text style={styles.telemText}>164 km • 62 km/h</Text>
            </View>
          </View>
        </View>

        {/* Route Steps Card */}
        <View style={styles.routeCard}>
          <Text style={styles.cardTitle}>Route & Address Details</Text>

          {/* Pickup */}
          <View style={styles.stopRow}>
            <View style={styles.stopIconCol}>
              <View style={styles.greenCircle} />
              <View style={styles.vertLine} />
            </View>
            <View style={styles.stopDetails}>
              <Text style={styles.stopType}>Origin Farm Pickup</Text>
              <Text style={styles.stopAddress}>{order.pickupAddress}</Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.stopRow}>
            <View style={styles.stopIconCol}>
              <View style={styles.redCircle} />
            </View>
            <View style={styles.stopDetails}>
              <Text style={styles.stopType}>Delivery Destination</Text>
              <Text style={styles.stopAddress}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Rider & Logistics Carrier Info */}
        <View style={styles.riderCard}>
          <View style={styles.riderHeader}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderLetter}>
                {order.deliveryRider?.name.charAt(0) || 'V'}
              </Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>
                {order.deliveryRider?.name || 'Vikas Shinde'}
              </Text>
              <Text style={styles.riderVehicle}>
                {order.deliveryRider?.vehicle || 'AgriSense Temperature-Controlled Van'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.phoneBtn}
              onPress={() =>
                Alert.alert(
                  'Contact Delivery Driver',
                  `Calling ${order.deliveryRider?.name} at ${order.deliveryRider?.phone}`
                )
              }
              activeOpacity={0.7}
            >
              <Phone size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* External Map Handoff Button */}
        <TouchableOpacity
          style={styles.navHandoffBtn}
          onPress={handleExternalNav}
          activeOpacity={0.85}
        >
          <Navigation size={18} color="#FFFFFF" />
          <Text style={styles.navHandoffText}>Open Navigation in Google Maps</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  demoBannerText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    fontWeight: '500',
  },
  mapCanvas: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  pinWrapper: {
    alignItems: 'center',
    width: 70,
  },
  originPin: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  destPin: {
    backgroundColor: '#DC2626',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  pinLocationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  roadLine: {
    flex: 1,
    height: 8,
    backgroundColor: '#64748B',
    borderRadius: 4,
    marginHorizontal: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedCenter: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#FEF08A',
  },
  truckBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  telemetryOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(20, 60, 34, 0.92)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  telemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telemDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  telemText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  stopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stopIconCol: {
    alignItems: 'center',
    width: 16,
  },
  greenCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
  },
  vertLine: {
    width: 2,
    height: 36,
    backgroundColor: '#CBD5E1',
    marginVertical: 2,
  },
  redCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  stopDetails: {
    flex: 1,
    paddingBottom: 10,
  },
  stopType: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  stopAddress: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  riderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  riderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  riderVehicle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  navHandoffBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  navHandoffText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
