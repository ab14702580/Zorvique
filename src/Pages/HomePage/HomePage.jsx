
import { Outlet } from 'react-router-dom';
import Footer from '../../Component/HomePageLayout/Footer';
import MainHeader from '../../Component/HomePageLayout/MainHeader';
import { useVisitorTrack } from '../../hooks/useVisitorTrack';

const HomePage = () => {
    useVisitorTrack(); // track unique visitors per day
    return (
        <div>
            <MainHeader />
            <Outlet />
            <Footer />
        </div>
    );
};

export default HomePage;