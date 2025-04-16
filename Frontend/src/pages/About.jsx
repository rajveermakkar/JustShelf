import React from 'react';
import { BookOpen, Heart, Users, Coffee, Star } from 'lucide-react';

const About = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Book Club Leader',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&h=250&auto=format&fit=crop',
      quote: 'JustShelf has transformed our book club experience. The selection is outstanding, and the service is impeccable.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Literature Professor',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop',
      quote: 'As an educator, I appreciate the quality and diversity of books available. My students love using this platform.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Avid Reader',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&h=250&auto=format&fit=crop',
      quote: "I've discovered so many amazing books through JustShelf. The recommendations are always spot-on!",
      rating: 5,
    }
  ];

  const values = [
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: 'Knowledge Access',
      description: 'Making quality books accessible to everyone'
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: 'Reader First',
      description: 'Every decision is made with our readers in mind'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Community',
      description: 'Building connections through shared reading'
    },
    {
      icon: <Coffee className="h-6 w-6 text-primary" />,
      title: 'Personal Touch',
      description: 'Curating each selection with care and passion'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Our Story
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Building the future of reading, one book at a time
            </p>
          </div>
        </div>
        <div className="mt-16 max-w-3xl mx-auto text-lg text-gray-500 text-center">
          <p className="mb-8">
            Founded in 2024, JustShelf began with a simple mission: to make quality books accessible to everyone.
            What started as a small online bookstore has grown into a community of passionate readers,
            sharing their love for literature and learning.
          </p>
          <p>
            Today, we curate thousands of books across all genres, ensuring each reader finds their perfect match.
            Our team of dedicated book lovers works tirelessly to bring you the best reading experience possible.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            What Our Readers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-primary font-medium text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-500 italic">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;