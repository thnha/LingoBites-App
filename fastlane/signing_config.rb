module SigningConfig
  def self.optional_env_value(env, name)
    value = env[name]
    value unless value.to_s.strip.empty?
  end
end
