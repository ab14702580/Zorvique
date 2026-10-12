
import { Outlet } from 'react-router-dom';
import Footer from '../../Component/HomePageLayout/Footer';
import MainHeader from '../../Component/HomePageLayout/MainHeader';
import TopUtilityBar from '../../Component/HomePageLayout/TopUtilityBar';
import { useVisitorTrack } from '../../hooks/useVisitorTrack';

const HomePage = () => {
    useVisitorTrack(); // track unique visitors per day
    return (
        <div>

            <TopUtilityBar />
            <MainHeader />
            <Outlet />
            <Footer />
        </div>
    );
};

export default HomePage;