require "minitest/autorun"

class IosStagingWorkflowTest < Minitest::Test
  WORKFLOW_PATH = File.expand_path("../../.github/workflows/ios-staging.yml", __dir__)

  def setup
    @workflow = File.read(WORKFLOW_PATH)
  end

  def test_requires_base64_signing_secrets
    %w[
      IOS_DISTRIBUTION_CERTIFICATE_BASE64
      IOS_DISTRIBUTION_CERTIFICATE_PASSWORD
      IOS_PROVISIONING_PROFILE_BASE64
    ].each do |name|
      assert_includes @workflow, "secrets.#{name}"
    end
  end

  def test_materializes_signing_files_in_runner_temp
    assert_includes @workflow, 'certificate_path="$RUNNER_TEMP/lingobites-signing/distribution.p12"'
    assert_includes @workflow, 'profile_path="$RUNNER_TEMP/lingobites-signing/staging.mobileprovision"'
    assert_includes @workflow, "IOS_DISTRIBUTION_CERTIFICATE_PATH=%s"
    assert_includes @workflow, "IOS_PROVISIONING_PROFILE_PATH=%s"
  end

  def test_cleanup_removes_materialized_signing_files
    assert_includes @workflow, 'rm -f "$RUNNER_TEMP/lingobites-signing/distribution.p12"'
    assert_includes @workflow, 'rm -f "$RUNNER_TEMP/lingobites-signing/staging.mobileprovision"'
  end
end
