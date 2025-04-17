import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function RegistrationScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
    crp: '',
    profileImage: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Precisamos da permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome completo é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.specialty) newErrors.specialty = 'Especialidade é obrigatória';
    if (!formData.crp) newErrors.crp = 'Registro profissional é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsLoading(true);
      // Simulando cadastro (substitua pela sua lógica de API)
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <FontAwesome5 name="seedling" size={32} color="white" />
        <Text style={styles.headerTitle}>Cadastro de Analista</Text>
        <Text style={styles.headerSubtitle}>Junte-se à nossa comunidade de especialistas</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        {/* Upload de Foto */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialIcons name="add-a-photo" size={28} color="#666" />
            </View>
          )}
          <Text style={styles.photoText}>Adicionar foto</Text>
        </TouchableOpacity>

        {/* Campos do Formulário */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <View style={[styles.inputContainer, errors.name && styles.inputError]}>
            <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail Profissional</Text>
          <View style={[styles.inputContainer, errors.email && styles.inputError]}>
            <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha segura"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Especialidade</Text>
          <View style={[styles.inputContainer, errors.specialty && styles.inputError]}>
            <FontAwesome5 name="microscope" size={18} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Entomologia, Fitopatologia, etc."
              value={formData.specialty}
              onChangeText={(text) => handleChange('specialty', text)}
            />
          </View>
          {errors.specialty && <Text style={styles.errorText}>{errors.specialty}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registro Profissional (CRP/CRMV)</Text>
          <View style={[styles.inputContainer, errors.crp && styles.inputError]}>
            <MaterialIcons name="assignment" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Número do seu registro"
              value={formData.crp}
              onChangeText={(text) => handleChange('crp', text)}
            />
          </View>
          {errors.crp && <Text style={styles.errorText}>{errors.crp}</Text>}
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Cadastrar</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>
            Já tem uma conta? <Text style={styles.loginLink}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  photoText: {
    marginTop: 10,
    color: '#4CAF50',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputError: {
    borderColor: '#F44336',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loginLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});