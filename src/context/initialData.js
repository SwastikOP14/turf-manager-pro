import { createId } from "../utils/id"

const today = new Date()
const y = today.getFullYear()
const m = String(today.getMonth() + 1).padStart(2, "0")

export function getInitialData() {
  const players = [
    {
      id: "p1",
      name: "Arjun Sharma",
      phone: "9888777665",
      address: "Sector 21, Chandigarh",
      balance: 1200,
      preferredPayment: "UPI",
      history: []
    },
    {
      id: "p2",
      name: "Chirag Sehgal",
      phone: "9123456789",
      address: "DLF Phase 3, Gurgaon",
      balance: -200,
      preferredPayment: "Cash",
      history: []
    },
    {
      id: "p3",
      name: "Priya Patel",
      phone: "9876501234",
      address: "Bandra West, Mumbai",
      balance: 750,
      preferredPayment: "UPI",
      history: []
    },
    {
      id: "p4",
      name: "Ritesh Mohapatra",
      phone: "9876543210",
      address: "Patia, Bhubaneswar",
      balance: 500,
      preferredPayment: "UPI",
      history: []
    },
    {
      id: "p5",
      name: "Ritik Raj",
      phone: "9000001111",
      address: "Koramangala, Bengaluru",
      balance: 100,
      preferredPayment: "Cash",
      history: []
    },
    {
      id: "p6",
      name: "Rahul Verma",
      phone: "9811122233",
      address: "Indiranagar, Bengaluru",
      balance: 320,
      preferredPayment: "UPI",
      history: []
    }
  ]

  const turfs = [
    {
      id: "t1",
      name: "Green Valley Ground",
      location: "Sector 45, Chandigarh",
      ownerName: "Rajesh Kumar",
      ownerContact: "9876500001"
    },
    {
      id: "t2",
      name: "City Sports Arena",
      location: "MG Road, Gurgaon",
      ownerName: "Amit Singh",
      ownerContact: "9876500002"
    },
    {
      id: "t3",
      name: "Victory Ground",
      location: "Salt Lake, Kolkata",
      ownerName: "Sanjay Das",
      ownerContact: "9876500003"
    }
  ]

  const sports = [
    { id: "cricket", name: "Cricket", icon: "cricket" },
    { id: "football", name: "Football", icon: "football" },
    { id: "basketball", name: "Basketball", icon: "basketball" },
    { id: "volleyball", name: "Volleyball", icon: "volleyball" },
    { id: "badminton", name: "Badminton", icon: "badminton" }
  ]

  const bookings = [
    {
      id: "BK0024",
      turfId: "t1",
      sportId: "cricket",
      date: `${y}-${m}-18`,
      startTime: "08:00",
      endTime: "10:00",
      amount: 2000,
      status: "Paid",
      paidAmount: 2000,
      paidByPlayerId: "p1",
      playerIds: ["p1", "p2", "p3", "p4", "p5"]
    },
    {
      id: "BK0025",
      turfId: "t2",
      sportId: "football",
      date: `${y}-${m}-17`,
      startTime: "18:00",
      endTime: "20:00",
      amount: 1500,
      status: "Partial",
      paidAmount: 1000,
      paidByPlayerId: "p2",
      playerIds: ["p2", "p3", "p4"]
    },
    {
      id: "BK0026",
      turfId: "t3",
      sportId: "cricket",
      date: `${y}-${m}-16`,
      startTime: "06:00",
      endTime: "08:00",
      amount: 2500,
      status: "Pending",
      paidAmount: 0,
      paidByPlayerId: "p4",
      playerIds: ["p4", "p5", "p6"]
    }
  ]

  const squads = [
    {
      id: "sq1",
      name: "Weekend Warriors",
      memberPlayerIds: ["p1", "p2", "p3"]
    },
    {
      id: "sq2",
      name: "Morning Crew",
      memberPlayerIds: ["p4", "p5", "p6"]
    }
  ]

  return {
    players,
    turfs,
    sports,
    bookings,
    squads,
    settings: {
      language: "English",
      notifications: {
        negativeBalance: true,
        booking: true,
        payment: true
      }
    }
  }
}

export function createEmptyPlayer() {
  return {
    id: createId("p"),
    name: "",
    phone: "",
    address: "",
    balance: 0,
    preferredPayment: "UPI",
    photo: null,
    sportPreferences: [], // Array of sport pref objects, order = priority
    history: []
  }
}
