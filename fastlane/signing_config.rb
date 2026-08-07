module SigningConfig
  def self.optional_env_value(env, name)
    value = env[name]
    value unless value.to_s.strip.empty?
  end

  def self.required_env_value(env, name)
    optional_env_value(env, name) || raise(KeyError, "Missing required environment variable: #{name}")
  end

  def self.certificate_import_options(env)
    {
      certificate_path: required_env_value(env, "IOS_DISTRIBUTION_CERTIFICATE_PATH"),
      certificate_password: required_env_value(env, "IOS_DISTRIBUTION_CERTIFICATE_PASSWORD"),
      keychain_name: required_env_value(env, "MATCH_KEYCHAIN_NAME"),
      # setup_ci intentionally creates the temporary keychain with a blank
      # password, so presence is required here but a blank value is valid.
      keychain_password: env.fetch("MATCH_KEYCHAIN_PASSWORD")
    }
  end

  def self.validate_profile!(profile, app_identifier:, development_team:)
    profile_name = profile.fetch("Name")
    team_identifiers = Array(profile.fetch("TeamIdentifier"))
    unless team_identifiers.include?(development_team)
      raise ArgumentError, "Provisioning profile '#{profile_name}' does not belong to team #{development_team}"
    end

    application_identifier = profile.fetch("Entitlements").fetch("application-identifier")
    unless application_identifier.end_with?(".#{app_identifier}")
      raise ArgumentError, "Provisioning profile '#{profile_name}' does not match bundle id #{app_identifier}"
    end

    profile_name
  end

  def self.archive_signing_settings(profile_name:, development_team:)
    settings = {}
    if profile_name
      settings["CODE_SIGN_STYLE"] = "Manual"
      settings["CODE_SIGN_IDENTITY"] = "Apple Distribution"
      settings["PROVISIONING_PROFILE_SPECIFIER"] = profile_name
    end
    settings["DEVELOPMENT_TEAM"] = development_team
    settings
  end
end
