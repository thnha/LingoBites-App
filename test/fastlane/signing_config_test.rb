require "minitest/autorun"
require_relative "../../fastlane/signing_config"

class SigningConfigTest < Minitest::Test
  def test_blank_optional_value_is_treated_as_unset
    assert_nil SigningConfig.optional_env_value({ "PROFILE" => "" }, "PROFILE")
  end

  def test_non_blank_optional_value_is_preserved
    assert_equal "LingoBites App Store", SigningConfig.optional_env_value(
      { "PROFILE" => "LingoBites App Store" },
      "PROFILE"
    )
  end

  def test_certificate_import_options_require_all_ci_signing_values
    error = assert_raises(KeyError) do
      SigningConfig.certificate_import_options(
        {
          "IOS_DISTRIBUTION_CERTIFICATE_PATH" => "/tmp/distribution.p12",
          "IOS_DISTRIBUTION_CERTIFICATE_PASSWORD" => "certificate-password",
          "MATCH_KEYCHAIN_NAME" => "fastlane_tmp_keychain"
        }
      )
    end

    assert_includes error.message, "MATCH_KEYCHAIN_PASSWORD"
  end

  def test_certificate_import_options_return_fastlane_arguments
    assert_equal(
      {
        certificate_path: "/tmp/distribution.p12",
        certificate_password: "certificate-password",
        keychain_name: "fastlane_tmp_keychain",
        keychain_password: ""
      },
      SigningConfig.certificate_import_options(
        {
          "IOS_DISTRIBUTION_CERTIFICATE_PATH" => "/tmp/distribution.p12",
          "IOS_DISTRIBUTION_CERTIFICATE_PASSWORD" => "certificate-password",
          "MATCH_KEYCHAIN_NAME" => "fastlane_tmp_keychain",
          "MATCH_KEYCHAIN_PASSWORD" => ""
        }
      )
    )
  end

  def test_validate_profile_returns_name_for_matching_team_and_bundle_id
    profile = {
      "Name" => "LingoBites Staging App Store",
      "TeamIdentifier" => ["TEAM123"],
      "Entitlements" => {
        "application-identifier" => "TEAM123.com.lingobites.staging"
      }
    }

    assert_equal "LingoBites Staging App Store", SigningConfig.validate_profile!(
      profile,
      app_identifier: "com.lingobites.staging",
      development_team: "TEAM123"
    )
  end

  def test_validate_profile_rejects_a_different_team
    profile = {
      "Name" => "Wrong Team Profile",
      "TeamIdentifier" => ["OTHERTEAM"],
      "Entitlements" => {
        "application-identifier" => "OTHERTEAM.com.lingobites.staging"
      }
    }

    error = assert_raises(ArgumentError) do
      SigningConfig.validate_profile!(
        profile,
        app_identifier: "com.lingobites.staging",
        development_team: "TEAM123"
      )
    end

    assert_includes error.message, "TEAM123"
  end

  def test_validate_profile_rejects_a_different_bundle_id
    profile = {
      "Name" => "Production Profile",
      "TeamIdentifier" => ["TEAM123"],
      "Entitlements" => {
        "application-identifier" => "TEAM123.com.lingobites.production"
      }
    }

    error = assert_raises(ArgumentError) do
      SigningConfig.validate_profile!(
        profile,
        app_identifier: "com.lingobites.staging",
        development_team: "TEAM123"
      )
    end

    assert_includes error.message, "com.lingobites.staging"
  end

  def test_archive_signing_settings_use_distribution_identity_for_manual_profile
    assert_equal(
      {
        "CODE_SIGN_STYLE" => "Manual",
        "CODE_SIGN_IDENTITY" => "Apple Distribution",
        "PROVISIONING_PROFILE_SPECIFIER" => "LingoBites Staging App Store",
        "DEVELOPMENT_TEAM" => "TEAM123"
      },
      SigningConfig.archive_signing_settings(
        profile_name: "LingoBites Staging App Store",
        development_team: "TEAM123"
      )
    )
  end

  def test_archive_signing_settings_leave_identity_automatic_without_manual_profile
    assert_equal(
      { "DEVELOPMENT_TEAM" => "TEAM123" },
      SigningConfig.archive_signing_settings(
        profile_name: nil,
        development_team: "TEAM123"
      )
    )
  end
end
