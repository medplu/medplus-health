import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../Shared/Colors';

const AllDoctorCardItem = ({ 
  doctor = {
    attributes: {
      Name: '',
      Year_of_Experience: 0,
      categories: { data: [{ attributes: { name: '' } }] },
      image: { data: { attributes: { formats: { thumbnail: { url: '' } } } } }
    }
  } 
}) => {
  if (!doctor || !doctor.attributes) {
    return null; // or render a placeholder
  }

  const { attributes } = doctor;
  const { Name, Year_of_Experience, categories, image } = attributes;

  return (
    <View style={styles.cardContainer}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        {image && image.data && image.data.attributes && image.data.attributes.formats && image.data.attributes.formats.thumbnail && (
          <Image
            source={{ uri: image.data.attributes.formats.thumbnail.url }}
            style={{ width: 120, height: 150, objectFit: 'contain', borderRadius: 15 }}
          />
        )}

        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.headingContainer}>
              <MaterialIcons name="verified" size={20} color={Colors.primary} />
              <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
                Professional Doctor
              </Text>
            </View>

            <FontAwesome name="heart" size={24} color={Colors.primary} />
          </View>

          <View>
            <Text style={styles.doctorName}>
              Dr. {Name}
            </Text>
            <Text style={styles.categoryName}>
              {categories && categories.data && categories.data.length > 0 && categories.data[0].attributes && categories.data[0].attributes.name}
            </Text>
            <Text style={[styles.categoryName, { color: Colors.primary }]}>
              {Year_of_Experience} Years
            </Text>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Inter-Black-Semi' }}>⭐⭐⭐⭐ 4.8 </Text>
            <Text style={{ color: Colors.gray }}>49 Reviews</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.makeAppointmentContainer}>
        <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
          Book Appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

AllDoctorCardItem.propTypes = {
  doctor: PropTypes.shape({
    attributes: PropTypes.shape({
      Name: PropTypes.string,
      Year_of_Experience: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      categories: PropTypes.shape({
        data: PropTypes.arrayOf(
          PropTypes.shape({
            attributes: PropTypes.shape({
              name: PropTypes.string
            })
          })
        )
      }),
      image: PropTypes.shape({
        data: PropTypes.shape({
          attributes: PropTypes.shape({
            formats: PropTypes.shape({
              thumbnail: PropTypes.shape({
                url: PropTypes.string
              })
            })
          })
        })
      })
    })
  })
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 18,
    fontFamily: 'Inter-Black-Semi',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Black',
    color: Colors.gray,
  },
  makeAppointmentContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.lightPrimary,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default AllDoctorCardItem;