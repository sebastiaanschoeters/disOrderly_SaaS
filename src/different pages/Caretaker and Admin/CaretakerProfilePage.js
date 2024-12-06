import {Avatar, Divider, ConfigProvider} from 'antd';
import { PhoneOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import '../../CSS/AntDesignOverride.css';
import { antThemeTokens, themes } from '../../Extra components/themes';
import useFetchCaretakerData from "../../UseHooks/useFetchCaretakerData";
import useThemeOnCSS from "../../UseHooks/useThemeOnCSS";

const ProfileDetail = ({ label, value, icon }) => (
    <p style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '5px'}}>
        <strong style={{ width: '20%', minWidth: '150px', flexShrink: 0 }}>{icon} {label}: </strong>
        <span style={{ flexWrap: 'wrap' }}>{value || 'Niet beschikbaar'}</span>
    </p>
);

const ProfileCard = ({ actCode }) => {
    console.log(actCode)
    const { profileData, isLoading, error } = useFetchCaretakerData(actCode)
    // Derive theme colors
    const theme = profileData.theme || 'blauw';
    const themeColors = themes[theme] || themes.blauw;

    console.log(profileData)

    useThemeOnCSS(themeColors);

    // Profile picture
    const profilePicture = profileData.profile_picture
        ? `${profileData.profile_picture}?t=${new Date().getTime()}`
        : "https://example.com/photo.jpg";

    return (
        <ConfigProvider theme={{ token: antThemeTokens(themeColors) }}>
            <div
                style={{
                    padding: '20px',
                    position: 'relative',
                    minWidth: '100%',
                    backgroundColor: themeColors.primary2,
                    color: themeColors.primary10,
                    zIndex: '0'
                }}
            >
                {/* Header section with profile picture, name, age, and biography */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <Avatar
                            src={profilePicture}
                            alt={profileData.name || "No Name"}
                            style ={{
                                minWidth: '200px',
                                minHeight: '200px',
                                borderRadius: '50%'
                            }}
                        />
                        <h2 style={{ margin: '0' }}>
                            {profileData.name || 'Naam'}
                        </h2>
                    </div>
                </div>

                <Divider />

                <ProfileDetail label="Telefoon nummer" value = {`${profileData.phone_number}`} icon={<PhoneOutlined />} />

                <Divider />

                <ProfileDetail label="E-mail" value={profileData.email} icon={<MailOutlined />} />

                <Divider />

                <ProfileDetail label="Organizatie" value={profileData.organization} icon={<TeamOutlined />} />

            </div>
        </ConfigProvider>
    );
};

export default ProfileCard;
