import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import StarIcon from '../StarIcon';
import './CourseCard.css';

function CourseCard({ course, purchased = false }) {
  const navigate = useNavigate();
  return (
    <div className="course-card" onClick={() => navigate(`/curso/${course.id}`)}>
      <div className="course-card__image-wrap">
        <img src={course.image} alt={course.title} className="course-card__image" />
        <span className="course-card__genre">{course.genre}</span>
        {purchased && (
          <span className="course-card__purchased">
            <CheckCircle size={14} /> Comprada
          </span>
        )}
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{course.title}</h3>
        <p className="course-card__instructor">{course.instructor}</p>
        <div className="course-card__footer">
          <span className="course-card__rating">
            <StarIcon /> {course.rating}
          </span>
          <span className="course-card__price">${course.price} COP</span>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;