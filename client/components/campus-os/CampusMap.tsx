
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Swords, Scroll, MapPin, UserPlus, Navigation, Loader2 } from 'lucide-react';

// Fix for default Leaflet marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string, iconHtml: string) => {
    return L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="w-8 h-8 rounded-full border-2 border-slate-50 shadow-lg flex items-center justify-center text-white" style="background-color: ${color}; transform: translate(-50%, -50%);">
            ${iconHtml}
           </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
    });
};

const questIcon = createIcon('#3b82f6', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>');
const memberIcon = createIcon('#ec4899', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>');
const userIcon = createIcon('#10b981', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');

// IET DAVV Coordinates base: 22.6811, 75.8800
const IET_DAVV_CENTER: [number, number] = [22.6811, 75.8800];
const CAMPUS_RADIUS = 400; // meters

// Mock Data adjusted for IET DAVV
const MOCK_QUESTS = [
    { id: 1, title: 'Library Wisdom', desc: 'Find the ancient tome in the IET Library.', lat: 22.6815, lng: 75.8805, reward: '500 XP' },
    { id: 2, title: 'Canteen Rush', desc: 'Help manage the crowd at the IET Canteen.', lat: 22.6805, lng: 75.8795, reward: '300 XP' },
    { id: 3, title: 'M-Block Challenge', desc: 'Solve the coding riddle in M-Block.', lat: 22.6820, lng: 75.8810, reward: '450 XP' },
    { id: 4, title: 'E-Block Circuit', desc: 'Fix the wiring in the E-Block lab.', lat: 22.6800, lng: 75.8790, reward: '600 XP' },
];

const MOCK_MEMBERS = [
    { id: 101, name: 'Hardik', role: 'Full Stack Dev', level: 20, lat: 22.6812, lng: 75.8802 },
    { id: 102, name: 'Yash', role: 'AI Engineer', level: 19, lat: 22.6808, lng: 75.8798 },
    { id: 103, name: 'Kavyansh', role: 'System Architect', level: 18, lat: 22.6818, lng: 75.8808 },
    { id: 104, name: 'Rhythm', role: 'Frontend Wizard', level: 17, lat: 22.6814, lng: 75.8794 },
];

// Component to handle map center updates
const RecenterMap = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 16);
    }, [center, map]);
    return null;
};

const CampusMap: React.FC<{ className?: string }> = ({ className }) => {
    const [activeQuest, setActiveQuest] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isLoadingLoc, setIsLoadingLoc] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(IET_DAVV_CENTER);

    // Get User Location
    const handleLocateMe = () => {
        setIsLoadingLoc(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPos: [number, number] = [latitude, longitude];
                    setUserLocation(newPos);
                    setMapCenter(newPos);
                    setIsLoadingLoc(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLoadingLoc(false);
                    // Fallback to IET default if fail
                    setMapCenter(IET_DAVV_CENTER);
                }
            );
        } else {
            console.error("Geolocation is not supported");
            setIsLoadingLoc(false);
        }
    };

    // Auto-locate on mount
    useEffect(() => {
        handleLocateMe();
    }, []);

    return (
        <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg ${className}`}>
            {/* Map Header Overlay - Light Theme */}
            {/* Map Header Overlay - Light Theme */}
            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-lg text-slate-800">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    IET DAVV CAMPUS
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Live Campus Grid</p>
            </div>

            {/* Locate Me Button - Light Theme */}
            <div className="absolute top-4 right-4 z-[400]">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/90 border-slate-200 hover:bg-white text-slate-700 rounded-full w-10 h-10 shadow-lg backdrop-blur-md"
                    onClick={handleLocateMe}
                    disabled={isLoadingLoc}
                >
                    {isLoadingLoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                </Button>
            </div>

            <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className="map-container"
            >
                <RecenterMap center={mapCenter} />

                {/* Light Mode Map Style */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Campus Highlight */}
                <Circle
                    center={IET_DAVV_CENTER}
                    radius={CAMPUS_RADIUS}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 2, dashArray: '5, 10' }}
                />

                {/* User Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <h4 className="font-bold text-sm text-slate-800">You are here</h4>
                                <p className="text-[10px] text-slate-500">Live GPS Signal</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Fallback Marker */}
                {!userLocation && (
                    <Marker position={IET_DAVV_CENTER} icon={createIcon('#64748b', '<div class="w-2 h-2 bg-white rounded-full"/>')}>
                        <Popup className="custom-popup">IET DAVV Center</Popup>
                    </Marker>
                )}

                {/* Quest Markers */}
                {MOCK_QUESTS.map((quest) => (
                    <Marker
                        key={quest.id}
                        position={[quest.lat, quest.lng]}
                        icon={questIcon}
                        eventHandlers={{
                            click: () => setActiveQuest(quest.id),
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                                    <Scroll className="w-4 h-4 text-blue-500" />
                                    <h4 className="font-bold text-sm text-slate-800">{quest.title}</h4>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{quest.desc}</p>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
                                    <span className="text-[10px] font-bold text-slate-500">REWARD</span>
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-[10px]">{quest.reward}</Badge>
                                </div>
                                <Button size="sm" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">Accept Quest</Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Member Markers */}
                {MOCK_MEMBERS.map((member) => (
                    <Marker key={member.id} position={[member.lat, member.lng]} icon={memberIcon}>
                        <Popup className="custom-popup">
                            <div className="min-w-[180px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-200">
                                        <Users className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight text-slate-800">{member.name}</h4>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                            Lvl {member.level} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {member.role}
                                        </div>
                                    </div>
                                </div>

                                <Button size="sm" variant="outline" className="w-full h-8 text-xs border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 gap-2">
                                    <UserPlus className="w-3 h-3" />
                                    Form Party
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend / Filter Overlay - Light Theme */}
            <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-lg hidden md:block">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div> Quests
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-3 h-3 rounded-full bg-pink-500"></div> Students
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div> You
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-dashed opacity-50"></div> Zone
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampusMap;
