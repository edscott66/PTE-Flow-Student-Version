import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scoreService } from '@/services/scoreService';
import { networkService } from '@/services/networkService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { db, auth, ensureAuth, handleFirestoreError, OperationType } from '@/services/firebase';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit, where, updateDoc, getDocs } from 'firebase/firestore';
import { Image } from 'react-native';
import CustomLoader from '@/components/CustomLoader';
import { LiveSprint } from '@/components/LiveSprint';

interface Lead {
  userId?: string;
  name: string;
  score: number;
  lastUpdate: string;
}

export default function Leaderboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDark } = useTheme();
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [canEdit, setCanEdit] = useState(true);
  const [currentSSID, setCurrentSSID] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myGroupId, setMyGroupId] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number>(0);

  useEffect(() => {
    checkNetwork();
    scoreService.getUserName().then(name => setUserName(name || 'Student'));
    
    // Initial load: get user details and local group ID
    const initData = async () => {
      const uid = await AsyncStorage.getItem('pte_flow_user_id');
      setCurrentUserId(uid);

      const currentScore = await scoreService.getScore();
      setUserScore(currentScore);

      let groupId = await scoreService.getGroupId();
      
      // DEFERRED ACTIVATION: Don't set a groupId until they earn points or scan a QR
      if (!groupId) {
        setMyGroupId(null);
      } else {
        setMyGroupId(groupId);
      }
    };

    initData();
  }, []);

  // Listen to Firestore leaderboard based on myGroupId or currentUserId
  useEffect(() => {
    const validUserId = currentUserId || auth.currentUser?.uid;
    if (!validUserId && !myGroupId) return;

    setLoading(true);
    let q;
    
    if (myGroupId) {
      q = query(
        collection(db, 'leaderboard'),
        where('groupId', '==', myGroupId)
      );
    } else {
      q = query(
        collection(db, 'leaderboard'),
        where('userId', '==', validUserId)
      );
    }
    
    const unsubscribe = onSnapshot(q, async (snapshot: any) => {
      const rawData = snapshot.docs.map((doc: any) => ({
        userId: doc.id,
        ...doc.data()
      })) as Lead[];
      
      // Deduplicate by player name to prevent duplicate rows for the same user across logouts/re-syncs
      const uniqueLeads: Record<string, Lead> = {};
      rawData.forEach(lead => {
        const nameKey = lead.name ? lead.name.toLowerCase().trim() : '';
        if (nameKey) {
          if (!uniqueLeads[nameKey] || lead.score > uniqueLeads[nameKey].score) {
            uniqueLeads[nameKey] = lead;
          }
        } else if (lead.userId) {
          if (!uniqueLeads[lead.userId] || lead.score > uniqueLeads[lead.userId].score) {
            uniqueLeads[lead.userId] = lead;
          }
        }
      });
      
      let sortedLeads = Object.values(uniqueLeads).sort((a, b) => b.score - a.score);

      setLeads(sortedLeads);
      setLoading(false);
    }, (error: any) => {
      handleFirestoreError(error, OperationType.LIST, 'leaderboard');
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [myGroupId, currentUserId]);

  const handleShowQR = async () => {
    const validUserId = currentUserId || auth.currentUser?.uid;
    // If we don't have a groupId yet, we explicitly "start" one to ensure sync
    if (!myGroupId && validUserId) {
      try {
        await scoreService.setGroupId(validUserId);
        setMyGroupId(validUserId);
        
        // Ensure this is reflected in Firestore so others can see us immediately
        await ensureAuth();
        const userDocRef = doc(db, 'leaderboard', validUserId);
        await setDoc(userDocRef, {
          groupId: validUserId,
          lastUpdate: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Failed to activate group on QR show", e);
      }
    }
    setShowQR(true);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
    userNameText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    subtitle: { fontSize: 14, color: colors.subtext, marginTop: 4 },
    readOnlyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
    readOnlyText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: colors.surface, marginBottom: 10 },
    actionButton: { alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  
    listContent: { padding: 15 },
    leadRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    rankContainer: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankText: { color: colors.primary, fontWeight: 'bold' },
    nameContainer: { flex: 1 },
    nameText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    timeText: { fontSize: 12, color: colors.subtext, marginTop: 2 },
    scoreContainer: { alignItems: 'flex-end' },
    scoreText: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    ptsLabel: { fontSize: 10, color: colors.subtext, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 40, color: colors.subtext },
  
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: colors.surface, padding: 30, borderRadius: 24, alignItems: 'center', width: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
    qrContainer: { padding: 20, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    modalDesc: { textAlign: 'center', color: colors.subtext, marginTop: 20, lineHeight: 20 },
    closeButton: { marginTop: 30, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
    closeButtonText: { color: '#fff', fontWeight: 'bold' },
  
    input: {
      width: '100%',
      backgroundColor: isDark ? colors.border : '#F1F5F9',
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
      fontSize: 16,
      color: colors.text
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
      width: '100%'
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center'
    },
    modalButtonText: {
      fontWeight: 'bold',
      color: '#fff'
    },
  
    scannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    scannerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    scannerFooter: { padding: 40, alignItems: 'center' },
    scannerDesc: { color: '#fff', textAlign: 'center' }
  });

  const checkNetwork = async () => {
    const ssid = await networkService.getCurrentSSID();
    setCurrentSSID(ssid);
    const editable = await networkService.canEditTable();
    setCanEdit(editable);
  };

  const fetchLeads = async (showLoading = true) => {
    // No longer needed with onSnapshot, but keeping for compatibility if called
    if (showLoading) setLoading(true);
    setLoading(false);
  };

  const handleScanPress = async () => {
    try {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setShowScanner(true);
      } else {
        Alert.alert("Permission Denied", "Camera permission is required to scan QR codes.");
      }
    } catch (err) {
      console.error("Camera permission error:", err);
      Alert.alert("Camera Error", "Could not access camera.");
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);
    
    if (data.startsWith('pteflow-group:')) {
      const scannedGroupId = data.split(':')[1];
      if (scannedGroupId) {
        await scoreService.setGroupId(scannedGroupId);
        setMyGroupId(scannedGroupId);
        
        const validUserId = currentUserId || auth.currentUser?.uid;
        // Update user's firebase document to join the group
        if (validUserId && userName) {
          try {
            await ensureAuth();
            
            // Rule 5 / Rule 1: Strip trailing numbers, then check if the new leaderboard is 
            // ALREADY ACTIVE with other users, and if the name is taken.
            let baseName = userName.replace(/\d+$/, '');
            let finalName = baseName;

            const qGroup = query(
              collection(db, 'leaderboard'),
              where('groupId', '==', scannedGroupId)
            );
            const snapshot = await getDocs(qGroup);
            
            let otherUsersInGroup = 0;
            let maxSuffix = 0;
            let exactNameExists = false;
            
            snapshot.forEach(docSnap => {
              if (docSnap.id !== validUserId) {
                otherUsersInGroup++;
                const otherName = docSnap.data().name || '';
                const otherBaseName = otherName.replace(/\d+$/, '');
                
                if (otherBaseName === baseName) {
                  if (otherName === baseName) exactNameExists = true;
                  const match = otherName.match(/\d+$/);
                  if (match) {
                    const num = parseInt(match[0], 10);
                    if (num > maxSuffix) maxSuffix = num;
                  }
                }
              }
            });

            // Group is already active with others AND exact name is taken
            if (otherUsersInGroup > 0 && exactNameExists) {
              const newSuffix = maxSuffix + 1;
              finalName = baseName + newSuffix;
              Alert.alert(
                "Name Taken",
                `That name is already in use on this Leaderboard. Your name has been changed to "${finalName}".`
              );
            }

            await scoreService.setUserName(finalName);
            setUserName(finalName);

            const userDocRef = doc(db, 'leaderboard', validUserId);
            
            // Per Rule 5: User joins a new leaderboard, so their score MUST reset to 0 to prevent cross-contamination.
            await scoreService.setScore(0);
            setUserScore(0);
            
            await setDoc(userDocRef, {
              groupId: scannedGroupId,
              name: finalName,
              score: 0,
              lastUpdate: new Date().toISOString()
            }, { merge: true });
          } catch (e) {
            console.error("Failed to join group in firebase", e);
          }
        }

        Alert.alert("Joined!", "You and the other user are now mutually on the same Global Leaderboard.");
        // We might want to force a refresh, but the onSnapshot listener will re-run when component re-mounts
        // or we could trigger a re-fetch.
      } else {
        Alert.alert("Invalid QR", "This QR code doesn't contain a valid group.");
      }
    } else {
      Alert.alert("Invalid QR", "Please scan a PTE Flow group QR code.");
    }
  };

  const handleLeaveGroup = async (itemUserId: string) => {
    if (itemUserId !== currentUserId) return;
    
    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave the group? Your score will be erased and reset to zero, and you will no longer appear on the shared leaderboard.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave Group", 
          style: "destructive",
          onPress: async () => {
            try {
              await ensureAuth();
              
              // When a user leaves the Global Leaderboard: Delete ANY number from the end of their name.
              let revertedName = userName.replace(/\d+$/, '');
              if (revertedName !== userName) {
                await scoreService.setUserName(revertedName);
                setUserName(revertedName);
              }

              // CRITICAL FIX: Update the user's document to reset their score and put them in a private group
              const userDocRef = doc(db, 'leaderboard', itemUserId);
              
              await scoreService.setScore(0);
              setUserScore(0);
              
              await updateDoc(userDocRef, {
                groupId: itemUserId, // Reassign to their own ID (private group)
                name: revertedName,
                score: 0,
                lastUpdate: new Date().toISOString()
              });
              
              // Update local group ID to their own ID (private mode)
              await scoreService.setGroupId(itemUserId);
              setMyGroupId(itemUserId);

              Alert.alert(
                "Left Group", 
                "You have left the shared leaderboard. Your score has been reset and you are now in private mode. Scan a QR code to join another group."
              );
              
              // The onSnapshot listener will automatically refresh the leaderboard
              // showing only the user's own entry (since groupId is now their userId)
              
            } catch (error) {
              console.error("Failed to leave group:", error);
              Alert.alert("Error", "Could not leave the group. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderLead = ({ item, index }: { item: Lead, index: number }) => {
    let bgColor = colors.surface;
    if (index === 0) bgColor = '#F0D089'; // Subtle Gold
    else if (index === 1) bgColor = '#CFCCCC'; // Subtle Silver
    else if (index === 2) bgColor = '#FAC38C'; // Subtle Bronze

    const dateObj = new Date(item.lastUpdate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day} / ${month} / ${year}`;
    
    // Only wrap in TouchableOpacity if it's the current user
    const isSelf = item.userId === currentUserId;

    const Content = (
      <View style={[styles.leadRow, { backgroundColor: bgColor }]}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.timeText}>{formattedDate}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.score}</Text>
          <Text style={styles.ptsLabel}>PTS</Text>
        </View>
      </View>
    );

    if (isSelf && item.userId) {
      return (
        <TouchableOpacity 
          onLongPress={() => handleLeaveGroup(item.userId!)} 
          delayLongPress={800} 
          activeOpacity={0.7}
        >
          {Content}
        </TouchableOpacity>
      );
    }

    return Content;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Global Leaderboard</Text>
          <View style={styles.userBadge}>
            <MaterialCommunityIcons name="account-circle" size={16} color="#2563EB" />
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>First Attempt Scores Only</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShowQR}>
          <MaterialCommunityIcons name="qrcode" size={24} color="#2563EB" />
          <Text style={styles.actionText}>Show QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleScanPress}>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#2563EB" />
          <Text style={styles.actionText}>Scan to Join</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => fetchLeads()}>
          <MaterialCommunityIcons name="refresh" size={24} color="#2563EB" />
          <Text style={styles.actionText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <CustomLoader message="Loading leaderboard..." />
      ) : (
        <FlatList
          data={leads}
          renderItem={renderLead}
          keyExtractor={(item) => item.userId || item.name}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <LiveSprint />
              {leads.length < 2 && (
                <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 16, marginBottom: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: colors.border }}>
                  <MaterialCommunityIcons name="account-group-outline" size={40} color={colors.subtext} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 10 }}>Session Inactive</Text>
                  <Text style={{ textAlign: 'center', color: colors.subtext, marginTop: 5 }}>Global Leaderboard scoring activates when 2 or more people join the group. Practice points are not shown here.</Text>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.emptyText}>
                No students on the leaderboard yet.
              </Text>
            </View>
          }
        />
      )}

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join My Group</Text>
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pteflow-group:${myGroupId || currentUserId || auth.currentUser?.uid}` }}
                style={{ width: 200, height: 200 }}
                referrerPolicy="no-referrer"
              />
            </View>
            <Text style={styles.modalDesc}>Others can scan this to join your local leaderboard.</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowQR(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <MaterialCommunityIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerDesc}>Align the QR code within the frame to join.</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}