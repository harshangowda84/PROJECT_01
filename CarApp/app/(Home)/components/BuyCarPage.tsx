import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import SellCarsImageCard from "./SellCarsImageCard";
import Navbar from "./Navbar";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/context/userContext";
import { updateUserData } from "../Services/backendoperations";
import colorThemes from "@/app/theme";
import { startChat } from "@/app/Chats/chatServices";

type Car = {
  carBrand: string;
  carModel: string;
  carStatus: string;
  exceptedPrice: number;
  fuelType: string;
  id: string;
  images: string[];
  km: number;
  location: string;
  modelYear: string;
  ownerName: string;
  phoneNumber: string;
  postedBy: string;
  postedDate: string;
  registrationNumber: string;
  transmissionType: string;
  description: string;
};

interface Styles {
  container: ViewStyle;
  greytext: TextStyle;
  overviewBlocks: ViewStyle;
}

export default function BuyCarPage() {
  const params = useLocalSearchParams();
  const [liked, setLiked] = useState<boolean>(false);
  const { user, forceSetUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const car: Car | null = params.data
    ? JSON.parse(params.data as string)
    : null;

  useEffect(() => {
    if (car && user) {
      const isLiked = user?.likedCars?.some((likedCar) => likedCar === car.id);
      setLiked(isLiked);
    }
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / Dimensions.get("screen").width
    );
    setCurrentIndex(index);
  };

  const toggleLikedCars = async () => {
    if (!user || !car) return;
    setLiked((liked) => {
      let userData = user;
      const updatedLikedList = liked
        ? user?.likedCars.filter((carId) => carId !== car.id)
        : [...(user.likedCars || []), car.id];
      userData.likedCars = updatedLikedList;
      const updateBackend = async () => {
        const updatedData = await updateUserData(userData);
        forceSetUser();
      };

      updateBackend();
      return !liked;
    });
  };

  const handleInterested = async () => {
    if (!car || !user) return;
    const chat = await startChat(car.id, user.id);
    console.log(chat);

    if (chat) {
      router.push({
        // will work, dont add index, it will break ...
        pathname: "/Chats/Conversation",
        params: {
          chat: JSON.stringify(chat),
          carData: JSON.stringify(car),
        },
      });
    }
  };

  if (!car) {
    return (
      <View style={styles.container}>
        <Text>Car details not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ScrollView style={{ padding: 5, backgroundColor: "#f5f5f5" }}>
        {/* Image Carousel section */}
        <View
          style={{
            flex: 1,
            height: 280,
            marginBottom: 10,
            backgroundColor: "white",
            elevation: 0.2,
            justifyContent: "center",
            alignItems: "center",
            width: Dimensions.get("screen").width,
          }}
        >
          <FlatList
            data={car.images || []}
            renderItem={({ item, index }) => (
              <SellCarsImageCard index={index} item={{ URI: item }} />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={flatListRef}
            onScroll={onScroll}
          />
        </View>

        {/* Pagination dots */}
        <View
          style={{
            marginVertical: 5,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          {(car.images || []).map((_, index) => (
            <View
              key={index}
              style={[
                {
                  backgroundColor: "grey",
                  borderRadius: "50%",
                  width: 10,
                  height: 10,
                },
                currentIndex === index && {
                  backgroundColor: colorThemes.primary2,
                  width: 12,
                  height: 12,
                },
              ]}
            />
          ))}
        </View>

        {/* Car details */}
        <View
          style={{
            backgroundColor: "white",
            marginVertical: 4,
            marginHorizontal: 10,
            elevation: 0.2,
            padding: 10,
            borderRadius: 7,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 700 }}>
            ₹ {car.exceptedPrice}
          </Text>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 30,
              fontWeight: 500,
              color: "#5c5c5c",
            }}
          >
            {car.carModel}
          </Text>

          <Text style={{ color: "#5c5c5c" }}>{car.modelYear}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              padding: 12,
              marginTop: 18,
              alignItems: "center",
              margin: "auto",
              borderTopWidth: 0.21,
              borderTopColor: "#5c5c5c",
            }}
          >
            {/* Fuel Type */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <Ionicons name="funnel-outline" size={22} color={"#5c5c5c"} />
              <Text
                style={{
                  color: "#5c5c5c",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {car.fuelType}
              </Text>
            </View>

            {/* Mileage */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <Ionicons name="speedometer-outline" size={22} />
              <Text
                style={{
                  color: "#5c5c5c",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {(car.km / 1000).toFixed(0)}k km
              </Text>
            </View>

            {/* Gear Type */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <EvilIcons name="gear" size={22} color="black" />
              <Text
                style={{
                  color: "#5c5c5c",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {car.transmissionType}
              </Text>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 10,
            marginVertical: 15,
            borderRadius: 7,
            elevation: 1,
          }}
        >
          <View
            style={{
              padding: 10,
              borderBottomWidth: 0.21,
              borderColor: "#5c5c5c",
            }}
          >
            <Text style={{ fontWeight: 600, color: "#5c5c5c", fontSize: 18 }}>
              Overview
            </Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            {/* Date */}
            <View style={styles.overviewBlocks}>
              <EvilIcons
                name="calendar"
                size={28}
                color="#5c5c5c"
                style={{ marginTop: -4 }}
              />
              <Text style={[styles.greytext, { fontSize: 14 }]}>
                Date - {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/*  Owner */}
            <View style={[styles.overviewBlocks, { gap: 4, marginStart: 5 }]}>
              <Feather name="users" size={22} color="#5c5c5c" />
              <Text style={[styles.greytext, { fontSize: 14 }]}>
                Owner - {car.ownerName}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.overviewBlocks}>
              <Ionicons
                name="location-outline"
                size={28}
                style={{ marginTop: -4 }}
                color="#5c5c5c"
              />
              <Text style={[styles.greytext]}>{car.location}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 10,
            marginVertical: 15,
            borderRadius: 7,
            elevation: 1,
          }}
        >
          <View
            style={{
              padding: 10,
              borderBottomWidth: 0.21,
              borderColor: "#5c5c5c",
            }}
          >
            <Text style={{ fontWeight: 600, color: "#5c5c5c", fontSize: 18 }}>
              Description
            </Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            {/* Description */}
            <Text>{car.description}</Text>
            <Text style={{ color: "blue" }}>Contact for more information</Text>
          </View>
        </View>
      </ScrollView>

      {/* Interested Button */}
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 15,
          height: 64,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            backgroundColor: colorThemes.primary2,
            flex: 1,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity onPress={handleInterested}>
            <Text style={{ fontSize: 20, color: "white" }}>Call</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{ width: 70, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity onPress={toggleLikedCars}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={40}
              color={colorThemes.primary2}
              style={{ paddingRight: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greytext: {
    color: "#5c5c5c",
  },
  overviewBlocks: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
});
