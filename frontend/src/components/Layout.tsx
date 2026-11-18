import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { ResetFab } from './ResetFab';

export function Layout() {
  const { courseId } = useParams();

  useEffect(() => {
    const root = document.documentElement;
    if (courseId) root.dataset.course = courseId;
    else delete root.dataset.course;
  }, [courseId]);

  return (
    <>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <footer className="foot">
        <span>CodeTrail. The runners here are small simulators that mirror how each language behaves.</span>
      </footer>
      <ResetFab />
    </>
  );
}
