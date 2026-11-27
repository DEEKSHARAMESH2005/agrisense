import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useDetection } from '../../context/DetectionContext';
import { DiseaseDetection } from '../../types';
import { Header } from '../../components/common/Header';
import { DiseaseResultModal } from './DiseaseResultModal';
import { Trash2, ChevronRight, AlertCircle, Scan } from 'lucide-react-native';

interface DiseaseHistoryScreenProps {
  navigation: any;
}

export const DiseaseHistoryScreen: React.FC<DiseaseHistoryScreenProps> = ({
  navigation,
}) => {
  const { history, clearHistory } = useDetection();
  const [selectedResult, setSelectedResult] = useState<DiseaseDetection | null>(null);

  const confirmClear = () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to delete all saved disease scan records?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const renderItem = ({ item }: { item: DiseaseDetection }) => {
    const isHealthy = item.diseaseName.toLowerCase().includes('healthy');

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setSelectedResult(item)}
      >
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />

        <View style={styles.infoCol}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.severityPill,
                {
                  backgroundColor: isHealthy
                    ? '#DCFCE7'
                    : item.severity === 'Severe'
                    ? '#FEE2E2'
                    : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.severityText,
                  {
                    color: isHealthy
                      ? '#16A34A'
                      : item.severity === 'Severe'
                      ? '#DC2626'
                      : '#B45309',
                  },
                ]}
              >
                {isHealthy ? 'Healthy' : item.severity}
              </Text>
            </View>
            <Text style={styles.confidenceText}>{item.confidence}% Match</Text>
          </View>

          <Text style={styles.diseaseTitle} numberOfLines={1}>
            {item.diseaseName}
          </Text>
          <Text style={styles.cropSub}>{item.cropName}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <ChevronRight size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Detection History"
        subtitle="Saved Crop Pathology Records"
        showBack={true}
        onBack={() => navigation.goBack()}
        showRoleSwitch={false}
        rightAction={
          history.length > 0 ? (
            <TouchableOpacity
              onPress={confirmClear}
              style={styles.trashBtn}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Scan size={44} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Scan History Yet</Text>
          <Text style={styles.emptySubtitle}>
            Scan diseased or healthy plant leaves to store diagnostic records here.
          </Text>
          <TouchableOpacity
            style={styles.scanNowBtn}
            onPress={() => navigation.navigate('DiseaseTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.scanNowText}>Open Camera Scanner</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <DiseaseResultModal
        visible={Boolean(selectedResult)}
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
        onScanAnother={() => {
          setSelectedResult(null);
          navigation.navigate('DiseaseTab');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  trashBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  confidenceText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  diseaseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cropSub: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  dateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  scanNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  scanNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
